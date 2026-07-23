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

  // Admin: Update settings (Supports both PUT and POST methods)
  .put('/admin/settings', async ({ headers, body, settingsRepo, authService }) => {
    const isAdmin = await authService.verifyCookie(headers.cookie);
    if (!isAdmin) return ResponseHelper.error('Unauthorized', 401);

    const updated = await settingsRepo.updateSettings(body as any);
    return { success: true, settings: updated };
  })
  .post('/admin/settings', async ({ headers, body, settingsRepo, authService }) => {
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
  })

  // Admin: 1-Click System Update (Runs 100% server-side inside Worker, NO CORS Proxy needed!)
  .post('/admin/system-update', async ({ headers, settingsRepo, authService, env }) => {
    const isAdmin = await authService.verifyCookie(headers.cookie);
    if (!isAdmin) return ResponseHelper.error('Unauthorized', 401);

    try {
      const settings = await settingsRepo.getAllSettings();
      const apiToken = (settings.cfApiToken || (env as any).CF_API_TOKEN || '').trim();
      if (!apiToken) {
        return ResponseHelper.error('Cloudflare API Token not found. Please enter and save your token in Cloudflare Update Authorization section first.', 400);
      }

      // 1. Download latest compiled worker bundle code from GitHub
      const bundleRes = await fetch('https://raw.githubusercontent.com/s7net/MonitorFlare-installer/main/public/worker-bundle.js');
      if (!bundleRes.ok) {
        return ResponseHelper.error('Failed to download latest release bundle from GitHub.', 500);
      }
      const bundleCode = await bundleRes.text();

      // 2. Get Account ID
      let accountId = (settings.cfAccountId || (env as any).CF_ACCOUNT_ID || '').trim();
      if (!accountId) {
        const accRes = await fetch('https://api.cloudflare.com/client/v4/accounts', {
          headers: { Authorization: `Bearer ${apiToken}` },
        });
        const accData = (await accRes.json()) as any;
        if (accData.success && accData.result && accData.result.length > 0) {
          accountId = accData.result[0].id;
        } else {
          return ResponseHelper.error('Could not auto-detect Cloudflare Account ID. Please enter it manually in settings.', 400);
        }
      }

      // 3. Determine exact active Worker script name from host header
      const host = (headers['host'] || headers['x-forwarded-host'] || '').split(':')[0];
      let scriptName = host.split('.')[0] || '';

      // Fallback: search Cloudflare scripts list if host is localhost or custom domain
      if (!scriptName || scriptName === 'localhost' || scriptName === '127') {
        const scriptListRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts`, {
          headers: { Authorization: `Bearer ${apiToken}` },
        });
        const scriptListData = (await scriptListRes.json()) as any;
        if (scriptListData.success && scriptListData.result && scriptListData.result.length > 0) {
          const match = scriptListData.result.find((s: any) => s.id.startsWith('flare-') || s.id.startsWith('probe-') || s.id.startsWith('monitorflare'));
          if (match) scriptName = match.id;
        }
      }

      // 4. Get script details to preserve D1 DB binding
      const scriptDetailRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${scriptName}`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      const scriptDetailData = (await scriptDetailRes.json()) as any;
      let dbBindingId = '';
      if (scriptDetailData.result && scriptDetailData.result.bindings) {
        const dbBinding = scriptDetailData.result.bindings.find((b: any) => b.type === 'd1' || b.name === 'DB');
        if (dbBinding) dbBindingId = dbBinding.id || dbBinding.database_id;
      }

      // 5. Upload updated script via Cloudflare REST API (Direct server fetch, no proxy!)
      const formData = new FormData();
      const metadataObj = {
        main_module: 'index.js',
        compatibility_date: '2024-09-23',
        compatibility_flags: ['nodejs_compat_v2'],
        bindings: dbBindingId ? [{ name: 'DB', type: 'd1', id: dbBindingId }] : [],
      };

      formData.append('metadata', new Blob([JSON.stringify(metadataObj)], { type: 'application/json' }));
      formData.append('index.js', new Blob([bundleCode], { type: 'application/javascript+module' }), 'index.js');

      const uploadRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${scriptName}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${apiToken}` },
        body: formData,
      });

      const uploadData = (await uploadRes.json()) as any;
      if (uploadRes.ok && uploadData.success) {
        return {
          success: true,
          message: '✓ MonitorFlare upgraded successfully to latest release!',
          scriptName,
        };
      } else {
        return ResponseHelper.error(uploadData.errors?.[0]?.message || 'Cloudflare API upload failed', 500);
      }
    } catch (err: any) {
      return ResponseHelper.error(err.message || 'System update error', 500);
    }
  });
