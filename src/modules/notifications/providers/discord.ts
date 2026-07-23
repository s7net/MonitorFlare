import type { Service } from '@/shared/types';

export class DiscordProvider {
  static async send(
    webhookUrl: string,
    alertType: 'down' | 'recovery',
    service: Service,
    details: { responseTime: number; statusCode?: number; error?: string; region?: string }
  ): Promise<void> {
    const isDown = alertType === 'down';
    const title = isDown ? `🚨 ${service.name} is DOWN` : `✅ ${service.name} has RECOVERED`;
    const color = isDown ? 15548997 : 2067276; // Red vs Green

    const embed = {
      title,
      color,
      fields: [
        { name: 'Service', value: service.name, inline: true },
        { name: 'Status Code', value: String(details.statusCode || 'N/A'), inline: true },
        { name: 'Response Time', value: `${details.responseTime}ms`, inline: true },
        { name: 'Check Type', value: service.checkType.toUpperCase(), inline: true },
        { name: 'Region', value: details.region || 'Direct', inline: true },
      ],
      timestamp: new Date().toISOString(),
    };

    if (details.error) {
      embed.fields.push({ name: 'Error', value: details.error, inline: false });
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });
  }
}
