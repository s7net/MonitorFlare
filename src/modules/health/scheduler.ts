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
  }
}
