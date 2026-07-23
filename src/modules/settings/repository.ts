import { eq } from 'drizzle-orm';
import type { Database } from '@/shared/database';
import { settings } from '@/shared/database/schema';
import type { SystemSettings } from '@/shared/types';

export const DEFAULT_SETTINGS: SystemSettings = {
  brandName: 'MonitorFlare',
  brandLogoUrl: '',
  brandColor: '#6366f1',
  downTemplate: `⚠️ *SERVICE DOWN ALERT*

🏷️ *Service:* \`{{service_name}}\`
🌐 *Endpoint:* \`{{service_url}}\`
📊 *Details:* Status: \`{{status_code}}\` | Latency: \`{{response_time}}ms\` | Check: \`{{check_type}}\` \`{{region}}\`
❌ *Error:* \`{{error}}\`
🕐 *Time:* \`{{time}}\``,

  recoveryTemplate: `✅ *SERVICE RECOVERY ALERT*

🏷️ *Service:* \`{{service_name}}\`
🌐 *Endpoint:* \`{{service_url}}\`
📊 *Details:* Status: \`{{status_code}}\` | Latency: \`{{response_time}}ms\`
🕐 *Time:* \`{{time}}\``,

  checkInterval: 5,
  autoBackupTelegram: false,
  autoBackupIntervalDays: 1,
  autoBackupBotToken: '',
  autoBackupChatId: '',
  lastBackupAt: null,
  customCss: '',
  customJs: '',
  totpEnabled: false,
  totpSecret: '',
  adminUsername: 'admin',
  adminPasswordHash: '',
  adminPanelPath: '/manage-x7k9',
  baseUrl: '',
};

export class SettingsRepository {
  constructor(private db: Database) {}

  async getAllSettings(): Promise<SystemSettings> {
    try {
      const rows = await this.db.select().from(settings);
      const map = new Map(rows.map(r => [r.key, r.value]));

      return {
        brandName: map.get('brand_name') ?? DEFAULT_SETTINGS.brandName,
        brandLogoUrl: map.get('brand_logo_url') ?? DEFAULT_SETTINGS.brandLogoUrl,
        brandColor: map.get('brand_color') ?? DEFAULT_SETTINGS.brandColor,
        downTemplate: map.get('down_template') ?? DEFAULT_SETTINGS.downTemplate,
        recoveryTemplate: map.get('recovery_template') ?? DEFAULT_SETTINGS.recoveryTemplate,
        checkInterval: parseInt(map.get('check_interval') || '5', 10),
        autoBackupTelegram: map.get('auto_backup_telegram') === 'true' || map.get('auto_backup_telegram') === '1',
        autoBackupIntervalDays: parseFloat(map.get('auto_backup_interval_days') || '1'),
        autoBackupBotToken: map.get('auto_backup_bot_token') || '',
        autoBackupChatId: map.get('auto_backup_chat_id') || '',
        lastBackupAt: map.get('last_backup_at') || null,
        customCss: map.get('custom_css') || '',
        customJs: map.get('custom_js') || '',
        totpEnabled: map.get('totp_enabled') === 'true' || map.get('totp_enabled') === '1',
        totpSecret: map.get('totp_secret') || '',
        adminUsername: map.get('admin_username') || DEFAULT_SETTINGS.adminUsername,
        adminPasswordHash: map.get('admin_password_hash') || '',
        adminPanelPath: map.get('admin_panel_path') || DEFAULT_SETTINGS.adminPanelPath,
        baseUrl: map.get('base_url') || DEFAULT_SETTINGS.baseUrl,
        cfApiToken: map.get('cf_api_token') || '',
        cfAccountId: map.get('cf_account_id') || '',
        cfWorkerName: map.get('cf_worker_name') || '',
        corsProxyUrl: map.get('cors_proxy_url') || 'https://monitorflare-cors-proxy.glynet.org',
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async updateSettings(newSettings: Partial<SystemSettings>): Promise<SystemSettings> {
    const keyMap: Record<string, string> = {
      brandName: 'brand_name',
      brandLogoUrl: 'brand_logo_url',
      brandColor: 'brand_color',
      downTemplate: 'down_template',
      recoveryTemplate: 'recovery_template',
      checkInterval: 'check_interval',
      autoBackupTelegram: 'auto_backup_telegram',
      autoBackupIntervalDays: 'auto_backup_interval_days',
      autoBackupBotToken: 'auto_backup_bot_token',
      autoBackupChatId: 'auto_backup_chat_id',
      lastBackupAt: 'last_backup_at',
      customCss: 'custom_css',
      customJs: 'custom_js',
      totpEnabled: 'totp_enabled',
      totpSecret: 'totp_secret',
      adminUsername: 'admin_username',
      adminPasswordHash: 'admin_password_hash',
      adminPanelPath: 'admin_panel_path',
      baseUrl: 'base_url',
      cfApiToken: 'cf_api_token',
      cfAccountId: 'cf_account_id',
      cfWorkerName: 'cf_worker_name',
      corsProxyUrl: 'cors_proxy_url',
    };

    for (const [prop, val] of Object.entries(newSettings)) {
      if (val !== undefined && keyMap[prop]) {
        const dbKey = keyMap[prop];
        const stringVal = String(val);
        
        await this.db
          .insert(settings)
          .values({ key: dbKey, value: stringVal })
          .onConflictDoUpdate({
            target: settings.key,
            set: { value: stringVal },
          });
      }
    }

    return this.getAllSettings();
  }
}
