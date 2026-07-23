import { Elysia } from 'elysia';
import { createDatabase } from '@/shared/database';
import { IncidentsRepository } from './repository';
import { AuthService } from '../auth/service';
import { ResponseHelper } from '@/shared/response';
import type { Env } from '@/shared/types';

export const incidentRoutes = new Elysia({ prefix: '/api' })
  .derive(({ store }) => {
    const env = store as unknown as Env;
    const db = createDatabase(env.DB);
    const incidentsRepo = new IncidentsRepository(db);
    const authService = new AuthService(env);
    return { incidentsRepo, authService };
  })

  // Public: Active incidents for main page banner
  .get('/incidents', async ({ incidentsRepo }) => {
    return await incidentsRepo.getActiveIncidents();
  })

  // Admin: Get all incidents (active & past)
  .get('/admin/incidents', async ({ headers, incidentsRepo, authService }) => {
    const isAdmin = await authService.verifyCookie(headers.cookie);
    if (!isAdmin) return ResponseHelper.error('Unauthorized', 401);
    return await incidentsRepo.getAllIncidents();
  })

  // Admin: Create incident banner
  .post('/incidents', async ({ headers, body, incidentsRepo, authService }) => {
    const isAdmin = await authService.verifyCookie(headers.cookie);
    if (!isAdmin) return ResponseHelper.error('Unauthorized', 401);

    try {
      const incident = await incidentsRepo.createIncident(body as any);
      return { success: true, incident };
    } catch (err) {
      return ResponseHelper.error(err instanceof Error ? err.message : 'Error creating incident', 400);
    }
  })

  // Admin: Update incident banner
  .put('/incidents/:id', async ({ headers, params, body, incidentsRepo, authService }) => {
    const isAdmin = await authService.verifyCookie(headers.cookie);
    if (!isAdmin) return ResponseHelper.error('Unauthorized', 401);

    try {
      await incidentsRepo.updateIncident(params.id, body as any);
      return { success: true };
    } catch (err) {
      return ResponseHelper.error(err instanceof Error ? err.message : 'Error updating incident', 400);
    }
  })

  // Admin: Delete incident banner
  .delete('/incidents/:id', async ({ headers, params, incidentsRepo, authService }) => {
    const isAdmin = await authService.verifyCookie(headers.cookie);
    if (!isAdmin) return ResponseHelper.error('Unauthorized', 401);

    try {
      await incidentsRepo.deleteIncident(params.id);
      return { success: true };
    } catch (err) {
      return ResponseHelper.error(err instanceof Error ? err.message : 'Error deleting incident', 400);
    }
  });
