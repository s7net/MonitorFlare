import type { Service, SystemSettings } from '@/shared/types';
import type { HealthRepository } from './repository';
import type { MonitoringRepository } from '../monitoring/repository';
import type { NotificationService } from '../notifications/service';
import { GlobalpingClient } from './globalping';

export class HealthChecker {
  constructor(
    private healthRepository: HealthRepository,
    private monitoringRepository: MonitoringRepository,
    private notificationService: NotificationService,
    private settings: SystemSettings
  ) {}

  async checkService(service: Service, baseUrl: string): Promise<void> {
    let isHealthy = false;
    let responseTime = 0;
    let statusCode: number | undefined;
    let errorMsg: string | undefined;
    let region: string = 'Direct';

    if (service.checkType === 'heartbeat') {
      const intervalSec = service.heartbeatInterval || 300;
      const lastCheckTime = service.lastCheckedAt ? new Date(service.lastCheckedAt).getTime() : 0;
      const elapsedSec = Math.floor((Date.now() - lastCheckTime) / 1000);

      isHealthy = lastCheckTime > 0 && elapsedSec <= intervalSec;
      responseTime = 0;
      region = 'Heartbeat';

      if (!isHealthy) {
        errorMsg = lastCheckTime === 0
          ? 'Heartbeat ping never received'
          : `Heartbeat overdue by ${elapsedSec - intervalSec}s (Expected every ${intervalSec}s)`;
      }
    } else if (service.checkType === 'globalping') {
      const gpResult = await GlobalpingClient.runCheck(
        service.url,
        service.method,
        service.expectedStatus,
        service.checkRegions || [],
        service.timeout,
        service.globalpingType || 'http'
      );

      isHealthy = gpResult.isHealthy;
      responseTime = gpResult.responseTime;
      statusCode = gpResult.statusCode || undefined;
      errorMsg = gpResult.error;
      region = gpResult.region;
    } else {
      const startTime = Date.now();
      try {
        const fetchHeaders: Record<string, string> = {
          'User-Agent': 'MonitorFlare/3.0 Status Checker',
        };

        if (service.headers) {
          if (typeof service.headers === 'object') {
            Object.assign(fetchHeaders, service.headers);
          } else if (typeof service.headers === 'string') {
            try {
              Object.assign(fetchHeaders, JSON.parse(service.headers));
            } catch {}
          }
        }

        const response = await fetch(service.url, {
          method: service.method,
          headers: fetchHeaders,
          signal: AbortSignal.timeout(service.timeout),
        });

        responseTime = Date.now() - startTime;
        statusCode = response.status;
        isHealthy = response.status === service.expectedStatus;

        if (!isHealthy) {
          errorMsg = `Expected status ${service.expectedStatus}, got ${response.status}`;
        } else if (service.keyword && service.keyword.trim()) {
          const bodyText = await response.text();
          if (!bodyText.includes(service.keyword.trim())) {
            isHealthy = false;
            errorMsg = `Keyword "${service.keyword}" not found in response body`;
          }
        }
      } catch (error) {
        responseTime = Date.now() - startTime;
        errorMsg = error instanceof Error ? error.message : 'Connection failed';
        isHealthy = false;
      }
    }

    // Retries & Consecutive Failures Evaluation
    const maxRetries = service.maxRetries || 1;
    let consecutiveFails = service.consecutiveFails || 0;

    if (isHealthy) {
      consecutiveFails = 0;
    } else {
      consecutiveFails += 1;
    }

    // Declare system unhealthy ONLY if consecutive failures reach maxRetries threshold
    const isEffectivelyUnhealthy = !isHealthy && consecutiveFails >= maxRetries;
    const currentStatus: 'healthy' | 'unhealthy' = isEffectivelyUnhealthy ? 'unhealthy' : 'healthy';

    // 1. Record health check log
    await this.healthRepository.createHealthCheck(
      service.id,
      isHealthy ? 'healthy' : 'unhealthy',
      responseTime,
      statusCode,
      errorMsg,
      region
    );

    // 2. Update service last checked state & consecutive failures count
    await this.monitoringRepository.updateService(service.id, {
      lastCheckedAt: service.checkType === 'heartbeat' && service.lastCheckedAt ? service.lastCheckedAt : new Date(),
      lastStatus: currentStatus,
      consecutiveFails: consecutiveFails,
    });

    // 3. Detect status transitions and trigger alerts
    const previousStatus = service.lastStatus;

    if (currentStatus === 'unhealthy' && previousStatus !== 'unhealthy') {
      console.log(`[ALERT DOWN] ${service.name} is DOWN after ${consecutiveFails} consecutive failed check(s)!`);
      await this.notificationService.sendAlert(
        'down',
        service,
        { responseTime, statusCode, error: errorMsg || `Failed ${consecutiveFails} consecutive times`, region },
        this.settings.downTemplate,
        baseUrl
      );
    } else if (isHealthy && previousStatus === 'unhealthy') {
      console.log(`[ALERT RECOVERY] ${service.name} has RECOVERED immediately!`);
      await this.notificationService.sendAlert(
        'recovery',
        service,
        { responseTime, statusCode, region },
        this.settings.recoveryTemplate,
        baseUrl
      );
    }
  }
}
