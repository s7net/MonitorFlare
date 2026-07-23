import type { GlobalpingType } from '@/shared/types';

export interface GlobalpingCheckResult {
  statusCode: number;
  responseTime: number;
  isHealthy: boolean;
  region: string;
  error?: string;
}

export class GlobalpingClient {
  static async runCheck(
    targetUrlOrHost: string,
    method: string = 'GET',
    expectedStatus: number = 200,
    regions?: string[],
    timeoutMs: number = 10000,
    gpType: GlobalpingType = 'http'
  ): Promise<GlobalpingCheckResult> {
    try {
      let targetHost = targetUrlOrHost.trim();
      let path = '/';
      try {
        if (targetHost.startsWith('http://') || targetHost.startsWith('https://')) {
          const parsed = new URL(targetHost);
          targetHost = parsed.hostname;
          path = parsed.pathname + parsed.search;
        }
      } catch {
        // use raw target if URL parsing fails
      }

      // Build location specifications
      const locations = (regions && regions.length > 0)
        ? regions.map(r => {
            const trimmed = r.trim();
            if (trimmed.length === 2) {
              if (['EU', 'NA', 'SA', 'AS', 'AF', 'OC'].includes(trimmed.toUpperCase())) {
                return { continent: trimmed.toUpperCase() };
              }
              return { country: trimmed.toUpperCase() };
            }
            return { magic: trimmed };
          })
        : [{ magic: 'world' }];

      const bodyPayload: Record<string, any> = {
        type: gpType,
        target: targetHost,
        locations: locations,
        limit: 1,
      };

      if (gpType === 'http') {
        bodyPayload.request = {
          method: method.toUpperCase(),
          path: path,
        };
      }

      // 1. Create measurement
      const createRes = await fetch('https://api.globalping.io/v1/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (!createRes.ok) {
        const errorText = await createRes.text();
        return {
          statusCode: createRes.status,
          responseTime: 0,
          isHealthy: false,
          region: regions?.join(',') || 'Globalping',
          error: `Globalping API error: ${createRes.status} ${errorText.substring(0, 100)}`,
        };
      }

      const { id } = (await createRes.json()) as { id: string };
      if (!id) {
        return {
          statusCode: 0,
          responseTime: 0,
          isHealthy: false,
          region: 'Globalping',
          error: 'No measurement ID returned from Globalping',
        };
      }

      // 2. Poll result
      const startTime = Date.now();
      while (Date.now() - startTime < timeoutMs) {
        await new Promise(r => setTimeout(r, 500));

        const pollRes = await fetch(`https://api.globalping.io/v1/measurements/${id}`);
        if (!pollRes.ok) continue;

        const data = (await pollRes.json()) as any;
        if (data.status === 'finished' || (data.results && data.results.length > 0 && data.results[0].result?.status === 'finished')) {
          const firstResult = data.results[0];
          if (!firstResult) break;

          const resData = firstResult.result || {};
          const probeData = firstResult.probe || {};
          const probeLocation = [probeData.city, probeData.country || probeData.continent].filter(Boolean).join(', ') || 'Globalping';

          if (gpType === 'ping') {
            const stats = resData.stats || {};
            const packetsLoss = stats.loss !== undefined ? stats.loss : (resData.packets?.loss ?? 100);
            const isHealthy = packetsLoss < 100;
            const responseTime = Math.round(stats.avg || stats.min || resData.responseTime || 0);

            return {
              statusCode: isHealthy ? 200 : 0,
              responseTime,
              isHealthy,
              region: probeLocation,
              error: isHealthy ? undefined : `ICMP Ping failed (${packetsLoss}% packet loss)`,
            };
          } else {
            const statusCode = resData.statusCode || 0;
            const responseTime = resData.timings?.total || resData.responseTime || 0;
            const isHealthy = statusCode === expectedStatus;
            const errorMsg = resData.error || (isHealthy ? undefined : `Expected status ${expectedStatus}, got ${statusCode}`);

            return {
              statusCode,
              responseTime,
              isHealthy,
              region: probeLocation,
              error: errorMsg,
            };
          }
        }
      }

      return {
        statusCode: 0,
        responseTime: Date.now() - startTime,
        isHealthy: false,
        region: 'Globalping',
        error: 'Globalping measurement timed out',
      };
    } catch (err) {
      return {
        statusCode: 0,
        responseTime: 0,
        isHealthy: false,
        region: 'Globalping',
        error: err instanceof Error ? err.message : 'Unknown Globalping error',
      };
    }
  }
}
