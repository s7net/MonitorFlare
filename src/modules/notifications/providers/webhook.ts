import type { Service } from '@/shared/types';

export class CustomWebhookProvider {
  static async send(
    webhookUrl: string,
    secretHeader: string | undefined,
    alertType: 'down' | 'recovery',
    service: Service,
    details: { responseTime: number; statusCode?: number; error?: string; region?: string }
  ): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'MonitorFlare/3.0 Webhook Alert',
    };

    if (secretHeader && secretHeader.trim()) {
      headers['X-MonitorFlare-Secret'] = secretHeader.trim();
    }

    const payload = {
      event: alertType === 'down' ? 'service.down' : 'service.recovered',
      timestamp: new Date().toISOString(),
      service: {
        id: service.id,
        name: service.name,
        url: service.showUrl ? service.url : null,
        method: service.method,
        checkType: service.checkType,
      },
      checkResult: {
        status: alertType === 'down' ? 'unhealthy' : 'healthy',
        responseTime: details.responseTime,
        statusCode: details.statusCode || null,
        error: details.error || null,
        region: details.region || 'Direct',
      },
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  }
}
