import { createDatabase } from '@/shared/database';
import { MonitoringRepository } from '../monitoring/repository';
import { NotificationRepository } from '../notifications/repository';
import { HealthRepository } from './repository';
import { SettingsRepository } from '../settings/repository';
import { IncidentsRepository } from '../incidents/repository';
import { HealthChecker } from './checker';
import { NotificationService } from '../notifications/service';
import type { Env } from '@/shared/types';

export class HealthScheduler {
  constructor(private env: Env) {}

  async run(): Promise<void> {
    console.log('[CRON] Running monitor checks at:', new Date().toISOString());

    const db = createDatabase(this.env.DB);
    const monitoringRepo = new MonitoringRepository(db);
    const healthRepo = new HealthRepository(db);
    const notificationRepo = new NotificationRepository(db);
    const settingsRepo = new SettingsRepository(db);
    const incidentsRepo = new IncidentsRepository(db);

    const settings = await settingsRepo.getAllSettings();
    const notificationService = new NotificationService(notificationRepo, this.env, settings);
    const healthChecker = new HealthChecker(healthRepo, monitoringRepo, notificationService, settings);

    const services = await monitoringRepo.getAllServices();
    console.log(`[CRON] Checking ${services.length} service(s)...`);

    await Promise.all(
      services.map(service =>
        healthChecker.checkService(service, settings.baseUrl || '')
      )
    );

    // Check auto-backup to Telegram if enabled
    if (settings.autoBackupTelegram) {
      try {
        const lastBackup = settings.lastBackupAt ? new Date(settings.lastBackupAt).getTime() : 0;
        const intervalMs = settings.autoBackupIntervalDays * 24 * 60 * 60 * 1000;
        const now = Date.now();

        if (now - lastBackup >= intervalMs) {
          console.log('[CRON] Triggering scheduled Telegram system backup...');
          const allServices = await monitoringRepo.getAllServices();
          const allNotifs = await notificationRepo.getNotifications();
          const allIncidents = await incidentsRepo.getAllIncidents();

          const backupData = {
            version: '3.0.0',
            exportedAt: new Date().toISOString(),
            settings,
            services: allServices,
            notifications: allNotifs,
            incidents: allIncidents,
          };

          const backupJson = JSON.stringify(backupData, null, 2);
          const sent = await notificationService.sendBackupToTelegram(
            backupJson,
            `monitorflare-auto-backup-${new Date().toISOString().slice(0, 10)}.json`
          );

          if (sent) {
            await settingsRepo.updateSettings({ lastBackupAt: new Date().toISOString() });
          }
        }
      } catch (err) {
        console.error('[CRON] Error during scheduled auto-backup:', err);
      }
    }

    // Auto-update from GitHub Releases if enabled
    if (settings.autoUpdateGithub && settings.cfApiToken) {
      try {
        console.log('[CRON] Auto-update from GitHub is enabled. Checking release bundle...');
        const bundleRes = await fetch('https://raw.githubusercontent.com/s7net/MonitorFlare-installer/main/public/worker-bundle.js');
        if (bundleRes.ok) {
          const bundleCode = await bundleRes.text();
          let accountId = settings.cfAccountId || '';
          if (!accountId) {
            const accRes = await fetch('https://api.cloudflare.com/client/v4/accounts', {
              headers: { Authorization: `Bearer ${settings.cfApiToken}` },
            });
            const accData = (await accRes.json()) as any;
            if (accData.success && accData.result?.[0]?.id) {
              accountId = accData.result[0].id;
            }
          }

          if (accountId) {
            let scriptName = settings.cfWorkerName || 'monitorflare';
            const scriptDetailRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${scriptName}`, {
              headers: { Authorization: `Bearer ${settings.cfApiToken}` },
            });
            const scriptDetailData = (await scriptDetailRes.json()) as any;
            let dbBindingId = '';
            if (scriptDetailData.result?.bindings) {
              const dbBinding = scriptDetailData.result.bindings.find((b: any) => b.type === 'd1' || b.name === 'DB');
              if (dbBinding) dbBindingId = dbBinding.id || dbBinding.database_id;
            }

            const formData = new FormData();
            const metadataObj = {
              main_module: 'index.js',
              compatibility_date: '2024-09-23',
              compatibility_flags: ['nodejs_compat_v2'],
              bindings: dbBindingId ? [{ name: 'DB', type: 'd1', id: dbBindingId }] : [],
            };

            formData.append('metadata', new Blob([JSON.stringify(metadataObj)], { type: 'application/json' }));
            formData.append('index.js', new Blob([bundleCode], { type: 'application/javascript+module' }), 'index.js');

            await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${scriptName}`, {
              method: 'PUT',
              headers: { Authorization: `Bearer ${settings.cfApiToken}` },
              body: formData,
            });
            console.log('[CRON] Worker script successfully auto-updated from GitHub!');
          }
        }
      } catch (updateErr) {
        console.error('[CRON] Error during background auto-update from GitHub:', updateErr);
      }
    }
  }
}
