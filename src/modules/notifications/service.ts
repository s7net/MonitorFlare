import type { NotificationRepository } from './repository';
import type { Service, Env, SlackConfig, SystemSettings } from '@/shared/types';
import { TelegramProvider } from './providers/telegram';
import { SlackProvider } from './providers/slack';
import { DiscordProvider } from './providers/discord';
import { CustomWebhookProvider } from './providers/webhook';

export class NotificationService {
  constructor(
    private repository: NotificationRepository,
    private env?: Env,
    private settings?: SystemSettings
  ) {}

  compileTemplate(
    template: string,
    data: {
      service_name: string;
      service_url: string;
      time: string;
      status_code: string | number;
      error: string;
      response_time: number;
      check_type: string;
      region: string;
    }
  ): string {
    let result = template;
    for (const [key, val] of Object.entries(data)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(val ?? ''));
    }
    return result;
  }

  async sendAlert(
    alertType: 'down' | 'recovery',
    service: Service,
    details: { responseTime: number; statusCode?: number; error?: string; region?: string },
    template: string,
    baseUrl: string
  ): Promise<void> {
    try {
      const timeStr = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Tehran',
        dateStyle: 'medium',
        timeStyle: 'medium',
      });

      const messageText = this.compileTemplate(template, {
        service_name: service.name,
        service_url: service.showUrl ? service.url : 'Hidden',
        time: timeStr,
        status_code: details.statusCode || (alertType === 'down' ? 'Failed' : 200),
        error: details.error || 'N/A',
        response_time: details.responseTime,
        check_type: service.checkType.toUpperCase(),
        region: details.region || 'Direct',
      });

      const dbNotifications = await this.repository.getEnabledNotifications();
      let sentCount = 0;

      // Send to registered integrations in database
      for (const notif of dbNotifications) {
        try {
          if (notif.type === 'telegram' && notif.config?.botToken && notif.config?.chatId) {
            await TelegramProvider.sendMessage(
              notif.config.botToken,
              notif.config.chatId,
              messageText,
              baseUrl,
              service.id,
              service.showUrl ? service.url : undefined
            );
            sentCount++;
          } else if (notif.type === 'slack' && notif.config?.webhookUrl) {
            await SlackProvider.send(
              notif.config as unknown as SlackConfig,
              service,
              { responseTime: details.responseTime, statusCode: details.statusCode || 0, error: details.error },
              baseUrl
            );
            sentCount++;
          } else if (notif.type === 'discord' && notif.config?.webhookUrl) {
            await DiscordProvider.send(
              notif.config.webhookUrl,
              alertType,
              service,
              details
            );
            sentCount++;
          } else if (notif.type === 'webhook' && notif.config?.webhookUrl) {
            await CustomWebhookProvider.send(
              notif.config.webhookUrl,
              notif.config.secretHeader,
              alertType,
              service,
              details
            );
            sentCount++;
          }
        } catch (err) {
          console.error(`[NOTIFICATION] Failed to send to ${notif.type} integration:`, err);
        }
      }

      // Fallback: If no DB integrations, check env secrets TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
      const botToken = this.env?.TELEGRAM_BOT_TOKEN;
      const chatId = this.env?.TELEGRAM_CHAT_ID;

      if (botToken && chatId && sentCount === 0) {
        try {
          await TelegramProvider.sendMessage(
            botToken,
            chatId,
            messageText,
            baseUrl,
            service.id,
            service.showUrl ? service.url : undefined
          );
          console.log('[NOTIFICATION] Sent alert via environment TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID');
        } catch (err) {
          console.error('[NOTIFICATION] Failed to send alert via env telegram secrets:', err);
        }
      }
    } catch (error) {
      console.error('[NOTIFICATION] Error in sendAlert:', error);
    }
  }

  async sendBackupToTelegram(
    backupJson: string,
    filename: string = 'monitorflare-backup.json'
  ): Promise<boolean> {
    const dbNotifications = await this.repository.getEnabledNotifications();
    
    // Dedicated backup bot token and chat ID with fallbacks
    let botToken = this.settings?.autoBackupBotToken || this.env?.TELEGRAM_BOT_TOKEN;
    let backupChatId = this.settings?.autoBackupChatId || this.env?.TELEGRAM_BACKUP_CHAT_ID || this.env?.TELEGRAM_CHAT_ID;

    // Check if any DB telegram integration has explicit botToken or backupChatId/chatId
    for (const notif of dbNotifications) {
      if (notif.type === 'telegram' && notif.config?.botToken) {
        if (!botToken) botToken = notif.config.botToken;
        if (!backupChatId) {
          backupChatId = notif.config.backupChatId || notif.config.chatId;
        }
      }
    }

    if (!botToken || !backupChatId) {
      console.warn('[BACKUP] Cannot send Telegram backup: Dedicated/Fallback Bot token or Chat ID missing.');
      return false;
    }

    try {
      await TelegramProvider.sendDocument(botToken, backupChatId, backupJson, filename);
      console.log(`[BACKUP] Successfully sent backup file to Telegram chat ID: ${backupChatId}`);
      return true;
    } catch (err) {
      console.error('[BACKUP] Failed to send Telegram backup document:', err);
      return false;
    }
  }
}
