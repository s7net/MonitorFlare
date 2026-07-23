import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { monitoringRoutes } from '@/modules/monitoring';
import { notificationRoutes } from '@/modules/notifications';
import { authRoutes } from '@/modules/auth';
import { settingsRoutes } from '@/modules/settings/routes';
import { incidentRoutes } from '@/modules/incidents/routes';
import { uiRoutes } from '@/modules/ui';
import type { Env } from '@/shared/types';

export const createApp = (env: Env) =>
  new Elysia({ aot: false, name: 'monitorflare' })
    .state('DB', env.DB)
    .state('BASE_URL', env.BASE_URL || '')
    .state('ADMIN_PANEL_PATH', env.ADMIN_PANEL_PATH || '/manage-x7k9')
    .state('ADMIN_USERNAME', env.ADMIN_USERNAME || 'admin')
    .state('ADMIN_PASSWORD', env.ADMIN_PASSWORD || '')
    .state('ADMIN_PASSWORD_HASH', env.ADMIN_PASSWORD_HASH || '')
    .state('SESSION_SECRET', env.SESSION_SECRET || '')
    .state('TELEGRAM_BOT_TOKEN', env.TELEGRAM_BOT_TOKEN || '')
    .state('TELEGRAM_CHAT_ID', env.TELEGRAM_CHAT_ID || '')
    .state('TELEGRAM_BACKUP_CHAT_ID', env.TELEGRAM_BACKUP_CHAT_ID || '')
    .use(cors({ credentials: true, origin: true }))
    .use(authRoutes)
    .use(monitoringRoutes)
    .use(notificationRoutes)
    .use(settingsRoutes)
    .use(incidentRoutes)
    .use(uiRoutes);
