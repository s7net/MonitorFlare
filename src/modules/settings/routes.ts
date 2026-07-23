import { Elysia } from 'elysia';
import { createDatabase } from '@/shared/database';
import { SettingsRepository } from './repository';
import { MonitoringRepository } from '../monitoring/repository';
import { NotificationRepository } from '../notifications/repository';
import { IncidentsRepository } from '../incidents/repository';
import { NotificationService } from '../notifications/service';
import { AuthService } from '../auth/service';
import { ResponseHelper } from '@/shared/response';
import type { Env } from '@/shared/types';

export const settingsRoutes = new Elysia({ prefix: '/api' })
  .derive(({ store }) => {
    const env = store as unknown as Env;
    const db = createDatabase(env.DB);
    const settingsRepo = new SettingsRepository(db);
    const monitoringRepo = new MonitoringRepository(db);
    const notificationRepo = new NotificationRepository(db);
    const incidentsRepo = new IncidentsRepository(db);
    const authService = new AuthService(env);
    const notificationService = new NotificationService(notificationRepo, env);

    return {
      settingsRepo,
      monitoringRepo,
      notificationRepo,
      incidentsRepo,
      authService,
      notificationService,
      env,
    };
  })

  // Public: Get settings (brand info, color)
  .get('/settings', async ({ settingsRepo }) => {
    const s = await settingsRepo.getAllSettings();
    return {
      brandName: s.brandName,
      brandLogoUrl: s.brandLogoUrl,
      brandColor: s.brandColor,
      checkInterval: s.checkInterval,
    };
  })

  // Admin: Get all settings including templates & backup config
  .get('/admin/settings', async ({ headers, settingsRepo, authService }) => {
    const isAdmin = await authService.verifyCookie(headers.cookie);
    if (!isAdmin) return ResponseHelper.error('Unauthorized', 401);
    return await settingsRepo.getAllSettings();
  })

  // Admin: Update settings
  .put('/admin/settings', async ({ headers, body, settingsRepo, authService }) => {
    const isAdmin = await authService.verifyCookie(headers.cookie);
    if (!isAdmin) return ResponseHelper.error('Unauthorized', 401);

    const updated = await settingsRepo.updateSettings(body as any);
    return { success: true, settings: updated };
  })

  // Admin: Export backup JSON
  .get('/admin/backup', async ({ headers, settingsRepo, monitoringRepo, notificationRepo, incidentsRepo, authService }) => {
    const isAdmin = await authService.verifyCookie(headers.cookie);
    if (!isAdmin) return ResponseHelper.error('Unauthorized', 401);

    const backupData = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      settings: await settingsRepo.getAllSettings(),
      services: await monitoringRepo.getAllServices(),
      notifications: await notificationRepo.getAllNotifications(),
      incidents: await incidentsRepo.getAllIncidents(),
    };

    return new Response(JSON.stringify(backupData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="monitorflare-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  })

  // Admin: Restore backup JSON
  .post('/admin/restore', async ({ headers, body, settingsRepo, monitoringRepo, notificationRepo, incidentsRepo, authService }) => {
    const isAdmin = await authService.verifyCookie(headers.cookie);
    if (!isAdmin) return ResponseHelper.error('Unauthorized', 401);

    const data = body as any;
    if (!data || (!data.services && !data.settings)) {
      return ResponseHelper.error('Invalid backup file structure', 400);
    }

    // 1. Restore settings
    if (data.settings) {
      await settingsRepo.updateSettings(data.settings);
    }

    // 2. Restore services
    if (Array.isArray(data.services)) {
      for (const s of data.services) {
        const existing = await monitoringRepo.getServiceById(s.id);
        if (existing) {
          await monitoringRepo.updateService(s.id, s);
        } else {
          await monitoringRepo.createService(s);
        }
      }
    }

    // 3. Restore notifications
    if (Array.isArray(data.notifications)) {
      for (const n of data.notifications) {
        const existing = await notificationRepo.getNotificationById(n.id);
        if (existing) {
          await notificationRepo.updateNotification(n.id, { config: n.config, enabled: n.enabled });
        } else {
          await notificationRepo.createNotification(n.type, n.config);
        }
      }
    }

    // 4. Restore incidents
    if (Array.isArray(data.incidents)) {
      for (const inc of data.incidents) {
        await incidentsRepo.createIncident(inc);
      }
    }

    return { success: true, message: 'System restored successfully' };
  })

  // Admin: Manually trigger Telegram backup
  .post('/admin/backup/telegram', async ({ headers, settingsRepo, monitoringRepo, notificationRepo, incidentsRepo, authService, notificationService }) => {
    const isAdmin = await authService.verifyCookie(headers.cookie);
    if (!isAdmin) return ResponseHelper.error('Unauthorized', 401);

    const backupData = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      settings: await settingsRepo.getAllSettings(),
      services: await monitoringRepo.getAllServices(),
      notifications: await notificationRepo.getAllNotifications(),
      incidents: await incidentsRepo.getAllIncidents(),
    };

    const backupJson = JSON.stringify(backupData, null, 2);
    const filename = `monitorflare-manual-backup-${new Date().toISOString().slice(0, 10)}.json`;

    const sent = await notificationService.sendBackupToTelegram(backupJson, filename);

    if (sent) {
      await settingsRepo.updateSettings({ lastBackupAt: new Date().toISOString() });
      return { success: true, message: 'Backup file sent to Telegram backup chat' };
    } else {
      return ResponseHelper.error('Failed to send backup file to Telegram. Check bot token and backup chat ID.', 500);
    }
  });
