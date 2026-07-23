import type { Env } from '@/shared/types';

// Simple in-memory rate limiting map for Workers (persists within warm instances)
const failedAttemptsMap = new Map<string, { count: number; resetAt: number }>();

export class AuthService {
  public adminPasswordHash?: string;
  private adminPasswordFallback?: string;
  private sessionSecret: string;
  // Set after loading from DB; defaults to 'admin' for backward compatibility
  public adminUsername: string = 'admin';

  constructor(env: Env) {
    this.adminPasswordHash = env.ADMIN_PASSWORD_HASH;
    this.adminPasswordFallback = env.ADMIN_PASSWORD || 'admin123';
    this.sessionSecret = env.SESSION_SECRET || 'monitorflare-default-secret-key-change-me';
  }

  /**
   * Hashes a plain password using SHA-256 for verification matching.
   */
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(`monitorflare:${password}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async verifyPassword(password: string): Promise<boolean> {
    if (this.adminPasswordHash) {
      const inputHash = await this.hashPassword(password);
      return inputHash === this.adminPasswordHash;
    }
    // Fallback to plain comparison if ADMIN_PASSWORD_HASH is not configured
    return password === this.adminPasswordFallback;
  }

  /**
   * Rate limiting for login attempts per IP address
   */
  isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = failedAttemptsMap.get(ip);
    if (!entry) return false;
    if (now > entry.resetAt) {
      failedAttemptsMap.delete(ip);
      return false;
    }
    return entry.count >= 5;
  }

  recordFailedAttempt(ip: string): void {
    const now = Date.now();
    const entry = failedAttemptsMap.get(ip);
    if (!entry || now > entry.resetAt) {
      failedAttemptsMap.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 }); // 15 min lock
    } else {
      entry.count += 1;
    }
  }

  clearFailedAttempts(ip: string): void {
    failedAttemptsMap.delete(ip);
  }

  /**
   * Signs a JWT token with HMAC-SHA256
   */
  async createToken(username: string): Promise<string> {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sub: username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const signature = await this.signHMAC(dataToSign, this.sessionSecret);
    return `${dataToSign}.${signature}`;
  }

  /**
   * Verifies JWT token validity and expiration
   */
  async verifyToken(token?: string): Promise<boolean> {
    if (!token) return false;

    // Backward compatibility check for base64 fallback token
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        // Check if legacy token btoa(user:pass)
        const decoded = atob(token);
        const [user, pass] = decoded.split(':');
        if (user === this.adminUsername && (pass === this.adminPasswordFallback || (await this.hashPassword(pass)) === this.adminPasswordHash)) {
          return true;
        }
        return false;
      }

      const [header, payload, signature] = parts;
      const expectedSignature = await this.signHMAC(`${header}.${payload}`, this.sessionSecret);

      if (signature !== expectedSignature) return false;

      const payloadObj = JSON.parse(this.base64UrlDecode(payload));
      if (payloadObj.exp && Math.floor(Date.now() / 1000) > payloadObj.exp) {
        return false;
      }

      return Boolean(payloadObj.sub && payloadObj.sub.length > 0);
    } catch {
      return false;
    }
  }

  async verifyCookie(cookieHeader?: string): Promise<boolean> {
    if (!cookieHeader) return false;
    const match = cookieHeader.match(/(?:^|;\s*)auth=([^;]+)/);
    if (!match || !match[1]) return false;
    return await this.verifyToken(match[1]);
  }

  private async signHMAC(data: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    return this.base64UrlEncodeBuffer(signatureBuffer);
  }

  private base64UrlEncode(str: string): string {
    const bytes = new TextEncoder().encode(str);
    return this.base64UrlEncodeBuffer(bytes.buffer);
  }

  private base64UrlEncodeBuffer(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    return atob(base64);
  }
}
