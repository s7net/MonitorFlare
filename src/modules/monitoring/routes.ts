import { Elysia } from 'elysia';
import { createDatabase } from '@/shared/database';
import { MonitoringRepository } from './repository';
import { MonitoringService } from './service';
import { HealthRepository } from '../health/repository';
import { AuthService } from '../auth/service';
import { GlobalpingClient } from '../health/globalping';
import { ResponseHelper } from '@/shared/response';
import type { Env } from '@/shared/types';

export const monitoringRoutes = new Elysia({ prefix: '/api' })
  .derive(async ({ store }) => {
    const env = store as unknown as Env;
    const db = createDatabase(env.DB);
    const repository = new MonitoringRepository(db);
    const service = new MonitoringService(repository);
    const healthRepository = new HealthRepository(db);
    const authService = new AuthService(env);
    try {
      const settingsRepo = new (await import('../settings/repository')).SettingsRepository(db);
      const settings = await settingsRepo.getAllSettings();
      if (settings.adminUsername) authService.adminUsername = settings.adminUsername;
      if (settings.adminPasswordHash) authService.adminPasswordHash = settings.adminPasswordHash;
    } catch {}
    return { monitoringRepository: repository, monitoringService: service, healthRepository, authService };
  })

  .all('/heartbeat/:token', async ({ params, monitoringRepository, healthRepository }) => {
    try {
      const token = params.token;
      if (!token) return ResponseHelper.error('Heartbeat token required', 400);

      const service = await monitoringRepository.getServiceByHeartbeatToken(token);
      if (!service) return ResponseHelper.error('Invalid heartbeat token', 404);

      const now = new Date();
      await healthRepository.createHealthCheck(
        service.id,
        'healthy',
        0,
        200,
        undefined,
        'Heartbeat'
      );

      await monitoringRepository.updateService(service.id, {
        lastCheckedAt: now,
        lastStatus: 'healthy',
      });

      return {
        success: true,
        message: `Heartbeat recorded for ${service.name}`,
        timestamp: now.toISOString(),
      };
    } catch (err) {
      return ResponseHelper.error(err instanceof Error ? err.message : 'Heartbeat error', 500);
    }
  })

  .get('/admin/export/csv', async ({ headers, monitoringService, healthRepository, authService }) => {
    const isAdmin = await authService.verifyCookie(headers.cookie);
    if (!isAdmin) return ResponseHelper.error('Unauthorized', 401);

    try {
      const services = await monitoringService.getAllServices();
      const rows = [
        ['ID', 'Name', 'Group', 'Target URL / Host', 'Check Engine', 'Protocol', 'Status', '24h Uptime (%)', 'Last Checked'].join(',')
      ];

      for (const s of services) {
        const uptime = await healthRepository.calculateUptime(s.id);
        const line = [
          `"${s.id}"`,
          `"${(s.name || '').replace(/"/g, '""')}"`,
          `"${(s.groupName || 'Default').replace(/"/g, '""')}"`,
          `"${(s.url || '').replace(/"/g, '""')}"`,
          `"${s.checkType.toUpperCase()}"`,
          `"${(s.globalpingType || 'http').toUpperCase()}"`,
          `"${s.lastStatus || 'healthy'}"`,
          `"${uptime.toFixed(2)}%"`,
          `"${s.lastCheckedAt ? new Date(s.lastCheckedAt).toISOString() : 'Never'}"`
        ].join(',');
        rows.push(line);
      }

      const csvContent = rows.join('\n');
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="monitorflare-sla-report.csv"',
        },
      });
    } catch (err) {
      return ResponseHelper.error('CSV export failed', 500);
    }
  })

  .post('/admin/test-check', async ({ headers, body, authService }) => {
    const isAdmin = await authService.verifyCookie(headers.cookie);
    if (!isAdmin) return ResponseHelper.error('Unauthorized', 401);

    try {
      const {
        url,
        method = 'GET',
        expectedStatus = 200,
        timeout = 10000,
        checkType = 'direct',
        globalpingType = 'http',
        checkRegions = []
      } = body as any;

      if (!url) return ResponseHelper.error('Target URL or Host is required', 400);

      const regionsArray = Array.isArray(checkRegions)
        ? checkRegions
        : (typeof checkRegions === 'string' ? checkRegions.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

      if (checkType === 'globalping') {
        const result = await GlobalpingClient.runCheck(
          url,
          method,
          expectedStatus,
          regionsArray,
          timeout,
          globalpingType
        );

        return {
          success: true,
          status: result.isHealthy ? 'healthy' : 'unhealthy',
          isHealthy: result.isHealthy,
          responseTime: result.responseTime,
          statusCode: result.statusCode,
          region: result.region,
          error: result.error || null,
        };
      } else {
        const startTime = Date.now();
        try {
          const res = await fetch(url, {
            method: method.toUpperCase(),
            signal: AbortSignal.timeout(timeout),
          });

          const responseTime = Date.now() - startTime;
          const isHealthy = res.status === Number(expectedStatus);

          return {
            success: true,
            status: isHealthy ? 'healthy' : 'unhealthy',
            isHealthy,
            responseTime,
            statusCode: res.status,
            region: 'Direct Worker',
            error: isHealthy ? null : `Expected status ${expectedStatus}, got ${res.status}`,
          };
        } catch (fetchErr) {
          return {
            success: true,
            status: 'unhealthy',
            isHealthy: false,
            responseTime: Date.now() - startTime,
            statusCode: 0,
            region: 'Direct Worker',
            error: fetchErr instanceof Error ? fetchErr.message : 'Connection failed',
          };
        }
      }
    } catch (err) {
      return ResponseHelper.error(err instanceof Error ? err.message : 'Test check error', 500);
    }
  })

  .post('/services', async ({ headers, body, monitoringService, authService }) => {
    const isAdmin = await authService.verifyCookie(headers.cookie);
    if (!isAdmin) return ResponseHelper.error('Unauthorized', 401);

    try {
      const result = await monitoringService.createService(body as any);
      return { success: true, service: result };
    } catch (error) {
      console.error('[Monitoring] Create error:', error);
      return ResponseHelper.error(
        error instanceof Error ? error.message : 'Unknown error',
        500
      );
    }
  })

  .get('/services', async ({ headers, monitoringService, healthRepository, authService }) => {
    const isAdmin = await authService.verifyCookie(headers.cookie);
    const services = await monitoringService.getAllServices();

    const servicesWithUptime = await Promise.all(
      services.map(async (s) => {
        const uptime = await healthRepository.calculateUptime(s.id);
        const latestChecks = await healthRepository.getHealthChecks(s.id, 1);
        const latestCheck = latestChecks && latestChecks.length > 0 ? latestChecks[0] : null;
        const currentLastStatus = latestCheck ? latestCheck.status : (s.lastStatus || 'healthy');
        const displayUrl = s.showUrl ? s.url : undefined;

        return {
          ...s,
          lastStatus: currentLastStatus,
          url: isAdmin ? s.url : displayUrl,
          displayUrl,
          uptime,
        };
      })
    );

    return servicesWithUptime;
  })

  .get('/services/:id', async ({ headers, params, monitoringService, authService }) => {
    const isAdmin = await authService.verifyCookie(headers.cookie);
    try {
      const service = await monitoringService.getServiceById(params.id);
      if (!service) {
        return ResponseHelper.error('Service not found', 404);
      }
      if (!service.showUrl && !isAdmin) {
        service.url = '';
      }
      return service;
    } catch (error) {
      console.error('[Monitoring] Get by ID error:', error);
      return ResponseHelper.error(
        error instanceof Error ? error.message : 'Unknown error',
        500
      );
    }
  })

  .get('/services/:id/checks', async ({ params, healthRepository }) => {
    try {
      return await healthRepository.getHealthChecks(params.id);
    } catch (error) {
      console.error('[Monitoring] Get checks error:', error);
      return ResponseHelper.error(
        error instanceof Error ? error.message : 'Unknown error',
        500
      );
    }
  })

  .put('/services/:id', async ({ headers, params, body, monitoringService, authService }) => {
    const isAdmin = await authService.verifyCookie(headers.cookie);
    if (!isAdmin) return ResponseHelper.error('Unauthorized', 401);

    try {
      await monitoringService.updateService(params.id, body as any);
      return { success: true };
    } catch (error) {
      console.error('[Monitoring] Update error:', error);
      return ResponseHelper.error(
        error instanceof Error ? error.message : 'Unknown error',
        500
      );
    }
  })

  .delete('/services/:id', async ({ headers, params, monitoringService, authService }) => {
    const isAdmin = await authService.verifyCookie(headers.cookie);
    if (!isAdmin) return ResponseHelper.error('Unauthorized', 401);

    try {
      await monitoringService.deleteService(params.id);
      return { success: true };
    } catch (error) {
      console.error('[Monitoring] Delete error:', error);
      return ResponseHelper.error(
        error instanceof Error ? error.message : 'Unknown error',
        500
      );
    }
  });
