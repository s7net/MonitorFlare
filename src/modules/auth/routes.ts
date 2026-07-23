import { Elysia } from 'elysia';
import { AuthService } from './service';
import { createDatabase } from '@/shared/database';
import { SettingsRepository } from '../settings/repository';
import { TOTP } from '@/shared/totp';
import type { Env } from '@/shared/types';

// In-memory temp storage for pre-auth 2FA tokens (expires in 5 minutes)
const preAuthTokens = new Map<string, { username: string; expiresAt: number }>();

export const authRoutes = new Elysia({ prefix: '/api' })
  .derive(({ store }) => {
    const env = store as unknown as Env;
    const db = createDatabase(env.DB);
    const authService = new AuthService(env);
    const settingsRepository = new SettingsRepository(db);
    return { authService, settingsRepository, env };
  })

  .post('/auth/login', async ({ body, headers, authService, settingsRepository, env }) => {
    const ip = headers['cf-connecting-ip'] || headers['x-forwarded-for'] || '127.0.0.1';

    if (authService.isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Too many failed login attempts. Please wait 15 minutes.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = (body || {}) as { username?: string; password?: string };
    const username = data.username || '';
    const password = data.password || '';

    const expectedUsername = env.ADMIN_USERNAME || 'admin';
    const isUserValid = username === expectedUsername;
    const isPassValid = await authService.verifyPassword(password);

    if (isUserValid && isPassValid) {
      authService.clearFailedAttempts(ip);

      const sysSettings = await settingsRepository.getAllSettings();
      if (sysSettings.totpEnabled && sysSettings.totpSecret) {
        // 2FA Enabled: Issue a temporary pre-auth token
        const preAuthToken = crypto.randomUUID();
        preAuthTokens.set(preAuthToken, {
          username,
          expiresAt: Date.now() + 5 * 60 * 1000,
        });

        return {
          success: true,
          requires2FA: true,
          preAuthToken,
        };
      }

      const token = await authService.createToken(username);
      return { success: true, token };
    }

    authService.recordFailedAttempt(ip);
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid username or password' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  })

  .post('/auth/verify-2fa', async ({ body, authService, settingsRepository }) => {
    const { preAuthToken, code } = (body || {}) as { preAuthToken?: string; code?: string };

    if (!preAuthToken || !code) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing pre-auth token or 2FA code' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const pending = preAuthTokens.get(preAuthToken);
    if (!pending || pending.expiresAt < Date.now()) {
      preAuthTokens.delete(preAuthToken || '');
      return new Response(
        JSON.stringify({ success: false, error: '2FA session expired. Please log in again.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sysSettings = await settingsRepository.getAllSettings();
    if (!sysSettings.totpSecret) {
      return new Response(
        JSON.stringify({ success: false, error: '2FA configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isValidCode = await TOTP.verifyTOTP(sysSettings.totpSecret, code);
    if (!isValidCode) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid 6-digit Authenticator code' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    preAuthTokens.delete(preAuthToken);
    const token = await authService.createToken(pending.username);
    return { success: true, token };
  })

  .get('/auth/verify', async ({ headers, authService }) => {
    const isValid = await authService.verifyCookie(headers.cookie);
    return { valid: isValid };
  })

  // 2FA Admin Setup API Endpoints
  .get('/admin/2fa/setup', async ({ headers, authService, settingsRepository }) => {
    const isAdmin = await authService.verifyCookie(headers.cookie);
    if (!isAdmin) return new Response('Unauthorized', { status: 401 });

    const sysSettings = await settingsRepository.getAllSettings();
    const secret = sysSettings.totpSecret || TOTP.generateSecret(16);
    const otpAuthUrl = TOTP.getOtpAuthUrl(secret, 'admin', sysSettings.brandName || 'MonitorFlare');
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`;

    return {
      success: true,
      enabled: Boolean(sysSettings.totpEnabled),
      secret,
      qrCodeUrl,
      otpAuthUrl,
    };
  })

  .post('/admin/2fa/enable', async ({ headers, body, authService, settingsRepository }) => {
    const isAdmin = await authService.verifyCookie(headers.cookie);
    if (!isAdmin) return new Response('Unauthorized', { status: 401 });

    const { secret, code } = (body || {}) as { secret?: string; code?: string };
    if (!secret || !code) {
      return new Response(JSON.stringify({ success: false, error: 'Secret and verification code required' }), { status: 400 });
    }

    const isValid = await TOTP.verifyTOTP(secret, code);
    if (!isValid) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid 6-digit code. Please check your Authenticator app.' }), { status: 400 });
    }

    await settingsRepository.updateSettings({
      totpEnabled: true,
      totpSecret: secret,
    });

    return { success: true, message: 'Two-Factor Authentication successfully enabled!' };
  })

  .post('/admin/2fa/disable', async ({ headers, body, authService, settingsRepository }) => {
    const isAdmin = await authService.verifyCookie(headers.cookie);
    if (!isAdmin) return new Response('Unauthorized', { status: 401 });

    const { code } = (body || {}) as { code?: string };
    const sysSettings = await settingsRepository.getAllSettings();

    if (sysSettings.totpSecret && code) {
      const isValid = await TOTP.verifyTOTP(sysSettings.totpSecret, code);
      if (!isValid) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid 6-digit code' }), { status: 400 });
      }
    }

    await settingsRepository.updateSettings({
      totpEnabled: false,
    });

    return { success: true, message: 'Two-Factor Authentication disabled.' };
  });
