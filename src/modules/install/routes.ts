import { Elysia, t } from 'elysia';
import { InstallService } from './service';
import { AuthService } from '../auth/service';
import type { Env } from '@/shared/types';

export const installRoutes = new Elysia({ prefix: '/api/install' })

  // Check Installation Status
  .get('/status', async ({ store }) => {
    const env = store as unknown as Env;
    const service = new InstallService(env.DB);
    const installed = await service.isInstalled();
    return { installed };
  })

  // Test Telegram Notification in Installer
  .post('/test-telegram', async ({ body, store }) => {
    const { botToken, chatId } = body as { botToken: string; chatId: string };
    if (!botToken || !chatId) {
      return new Response(JSON.stringify({ success: false, error: 'Bot Token and Chat ID are required' }), { status: 400 });
    }

    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '⚡️ MonitorFlare Auto-Installer Test Message\n\nYour Telegram Alert Bot connection is verified!',
          parse_mode: 'HTML',
        }),
      });

      const data = await res.json() as { ok: boolean; description?: string };
      if (res.ok && data.ok) {
        return { success: true };
      }
      return new Response(JSON.stringify({ success: false, error: data.description || 'Failed to send message' }), { status: 400 });
    } catch (e) {
      return new Response(JSON.stringify({ success: false, error: 'Connection error' }), { status: 500 });
    }
  })

  // Execute D1 Auto-Installer & Launch
  .post('/execute', async ({ body, store }) => {
    const env = store as unknown as Env;
    const installService = new InstallService(env.DB);

    // Prevent re-installation if already installed
    const alreadyInstalled = await installService.isInstalled();
    if (alreadyInstalled) {
      return new Response(JSON.stringify({ success: false, error: 'MonitorFlare is already installed' }), { status: 400 });
    }

    const {
      adminUsername,
      adminPassword,
      botToken,
      chatId,
      brandName,
      brandLogoUrl,
    } = body as {
      adminUsername?: string;
      adminPassword?: string;
      botToken?: string;
      chatId?: string;
      brandName?: string;
      brandLogoUrl?: string;
    };

    if (!adminUsername || !adminPassword || adminPassword.length < 6) {
      return new Response(JSON.stringify({ success: false, error: 'Valid username and password (6+ chars) required' }), { status: 400 });
    }

    try {
      // 1. Hash Admin Password
      const authService = new AuthService(env);
      const passwordHash = await authService.hashPassword(adminPassword);

      // 2. Prepare Settings
      const settings: Record<string, string> = {
        admin_username: adminUsername,
        admin_password_hash: passwordHash,
        brand_name: brandName || 'MonitorFlare Status',
        brand_logo_url: brandLogoUrl || '',
      };

      // 3. Complete D1 Database Bootstrapping and Save Settings
      await installService.completeInstallation(settings);

      // 4. Save Telegram Notification Integration if provided
      if (botToken && chatId) {
        const notifId = 'notif_default_telegram';
        const notifConfig = JSON.stringify({ botToken, chatId });
        const now = Date.now();

        await env.DB.prepare(`
          INSERT INTO notifications (id, type, enabled, config, created_at)
          VALUES (?, 'telegram', 1, ?, ?)
          ON CONFLICT(id) DO UPDATE SET config = excluded.config
        `).bind(notifId, notifConfig, now).run();
      }

      return { success: true };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown installation failure';
      return new Response(JSON.stringify({ success: false, error: msg }), { status: 500 });
    }
  });
