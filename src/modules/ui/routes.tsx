import { Elysia } from 'elysia';
import { Html, html } from '@elysiajs/html';
import { MonitorOverview } from './pages/MonitorOverview';
import { MonitoringPage } from './pages/MonitoringPage';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { createDatabase } from '@/shared/database';
import { MonitoringRepository } from '../monitoring/repository';
import { HealthRepository } from '../health/repository';
import { AuthService } from '../auth/service';
import type { Env } from '@/shared/types';

export const uiRoutes = new Elysia({ aot: false })
  .use(html())

  .get('/', async ({ headers, store, html }) => {
    const env = store as unknown as Env;
    const authService = new AuthService(env);
    const isAdmin = await authService.verifyCookie(headers.cookie);
    const adminPath = env.ADMIN_PANEL_PATH || '/manage-x7k9';
    return html(<MonitorOverview isAdmin={isAdmin} adminPath={adminPath} />);
  })

  // Explicitly return 404 for standard /admin and /admin/login paths so admin panel path remains hidden
  .get('/admin', () => new Response('404 Not Found', { status: 404 }))
  .get('/admin/login', () => new Response('404 Not Found', { status: 404 }))

  // Configurable Admin Login and Dashboard routes
  .all('*', async ({ path, headers, store, html, set }) => {
    const env = store as unknown as Env;
    const adminPath = env.ADMIN_PANEL_PATH || '/manage-x7k9';
    const loginPath = `${adminPath}/login`;

    const cleanPath = (path.length > 1 && path.endsWith('/')) ? path.slice(0, -1) : path;

    const authService = new AuthService(env);
    const isAdmin = await authService.verifyCookie(headers.cookie);

    if (cleanPath === loginPath) {
      if (isAdmin) {
        return new Response(null, {
          status: 302,
          headers: { Location: adminPath },
        });
      }
      set.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0';
      set.headers['Pragma'] = 'no-cache';
      return html(<AdminLogin adminPath={adminPath} />);
    }

    if (cleanPath === adminPath) {
      if (!isAdmin) {
        return new Response(null, {
          status: 302,
          headers: { Location: loginPath },
        });
      }
      set.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0';
      set.headers['Pragma'] = 'no-cache';
      return html(<AdminDashboard adminPath={adminPath} />);
    }

    if (path.startsWith('/monitoring/')) {
      const id = path.replace('/monitoring/', '');
      try {
        const db = createDatabase(env.DB);
        const monitoringRepo = new MonitoringRepository(db);
        const healthRepo = new HealthRepository(db);

        const service = await monitoringRepo.getServiceById(id);
        if (!service) {
          return new Response('Service not found', { status: 404 });
        }

        const checks = await healthRepo.getHealthChecks(id);
        const uptime =
          checks.length > 0
            ? (checks.filter(c => c.status === 'healthy').length / checks.length) * 100
            : 100;

        if (!service.showUrl && !isAdmin) {
          service.url = '';
        }

        return html(<MonitoringPage service={service} checks={checks} uptime={uptime} isAdmin={isAdmin} adminPath={adminPath} />);
      } catch (error) {
        return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown'}`, { status: 500 });
      }
    }

    return new Response('404 Not Found', { status: 404 });
  });
