import { eq } from 'drizzle-orm';
import type { Database } from '@/shared/database';
import { services } from '@/shared/database/schema';
import type { CreateServiceDTO, Service } from '@/shared/types';
import { CONFIG } from '@/shared/config';

export class MonitoringRepository {
  constructor(private db: Database) {}

  private mapRowToService(row: any): Service {
    let checkRegions: string[] | null = null;
    if (row.checkRegions || row.check_regions) {
      const raw = row.checkRegions || row.check_regions;
      try {
        checkRegions = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch {
        checkRegions = String(raw).split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    let parsedHeaders: Record<string, string> | null = null;
    const rawHeaders = row.headers;
    if (rawHeaders) {
      if (typeof rawHeaders === 'object') {
        parsedHeaders = rawHeaders;
      } else if (typeof rawHeaders === 'string' && rawHeaders.trim()) {
        try {
          parsedHeaders = JSON.parse(rawHeaders);
        } catch {
          parsedHeaders = null;
        }
      }
    }

    const isShowUrl = row.showUrl !== undefined ? Boolean(row.showUrl) : (row.show_url !== undefined ? Boolean(row.show_url) : true);
    const isSslCheck = row.sslCheck !== undefined ? Boolean(row.sslCheck) : (row.ssl_check !== undefined ? Boolean(row.ssl_check) : false);

    return {
      id: row.id,
      name: row.name,
      url: row.url,
      method: row.method || CONFIG.DEFAULT_METHOD,
      timeout: row.timeout || CONFIG.DEFAULT_TIMEOUT,
      expectedStatus: row.expectedStatus || CONFIG.DEFAULT_EXPECTED_STATUS,
      checkType: (row.checkType || row.check_type || 'direct') as any,
      globalpingType: (row.globalpingType || row.globalping_type || 'http') as any,
      checkRegions: checkRegions,
      showUrl: isShowUrl,
      headers: parsedHeaders,
      keyword: row.keyword || row.keyword === '' ? row.keyword : null,
      groupName: row.groupName || row.group_name || null,
      sslCheck: isSslCheck,
      heartbeatToken: row.heartbeatToken || row.heartbeat_token || null,
      heartbeatInterval: row.heartbeatInterval || row.heartbeat_interval || null,
      maxRetries: row.maxRetries || row.max_retries || 1,
      consecutiveFails: row.consecutiveFails || row.consecutive_fails || 0,
      lastCheckedAt: row.lastCheckedAt || row.last_checked_at ? new Date(row.lastCheckedAt || row.last_checked_at) : null,
      lastStatus: row.lastStatus || row.last_status || null,
      createdAt: new Date(row.createdAt || row.created_at),
    };
  }

  async createService(data: CreateServiceDTO): Promise<Service> {
    let regionsJson: string | null = null;
    if (Array.isArray(data.checkRegions)) {
      regionsJson = JSON.stringify(data.checkRegions);
    } else if (typeof data.checkRegions === 'string' && data.checkRegions.trim()) {
      regionsJson = JSON.stringify(data.checkRegions.split(',').map(s => s.trim()).filter(Boolean));
    }

    let headersJson: string | null = null;
    if (data.headers) {
      if (typeof data.headers === 'object') {
        headersJson = JSON.stringify(data.headers);
      } else if (typeof data.headers === 'string' && data.headers.trim()) {
        headersJson = data.headers.trim();
      }
    }

    const expNum = Number(data.expectedStatus);
    const expectedStatus = (!isNaN(expNum) && expNum > 0) ? expNum : CONFIG.DEFAULT_EXPECTED_STATUS;

    const timeoutNum = Number(data.timeout);
    const timeout = (!isNaN(timeoutNum) && timeoutNum > 0) ? timeoutNum : CONFIG.DEFAULT_TIMEOUT;

    const maxRetriesNum = Number(data.maxRetries);
    const maxRetries = (!isNaN(maxRetriesNum) && maxRetriesNum > 0) ? maxRetriesNum : 1;

    const serviceRow = {
      id: crypto.randomUUID(),
      name: data.name,
      url: data.url,
      method: data.method || CONFIG.DEFAULT_METHOD,
      timeout,
      expectedStatus,
      checkType: data.checkType || 'direct',
      globalpingType: data.globalpingType || 'http',
      checkRegions: regionsJson,
      showUrl: data.showUrl !== undefined ? Boolean(data.showUrl) : true,
      headers: headersJson,
      keyword: data.keyword || null,
      groupName: data.groupName || null,
      sslCheck: data.sslCheck !== undefined ? Boolean(data.sslCheck) : false,
      heartbeatToken: data.checkType === 'heartbeat' ? (data.heartbeatToken || crypto.randomUUID().slice(0, 16)) : null,
      heartbeatInterval: data.heartbeatInterval ? Number(data.heartbeatInterval) : null,
      maxRetries,
      consecutiveFails: 0,
      createdAt: new Date(),
    };

    await this.db.insert(services).values(serviceRow as any);
    return this.mapRowToService(serviceRow);
  }

  async getServiceById(id: string): Promise<Service | null> {
    const result = await this.db
      .select()
      .from(services)
      .where(eq(services.id, id))
      .get();

    return result ? this.mapRowToService(result) : null;
  }

  async getServiceByHeartbeatToken(token: string): Promise<Service | null> {
    const result = await this.db
      .select()
      .from(services)
      .where(eq(services.heartbeatToken, token))
      .get();

    return result ? this.mapRowToService(result) : null;
  }

  async getAllServices(): Promise<Service[]> {
    const rows = await this.db.select().from(services).all();
    return rows.map(r => this.mapRowToService(r));
  }

  async updateService(id: string, data: Partial<CreateServiceDTO> & { lastCheckedAt?: Date; lastStatus?: string; consecutiveFails?: number }): Promise<void> {
    const updateData: Record<string, any> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.method !== undefined) updateData.method = data.method;
    if (data.timeout !== undefined) {
      const t = Number(data.timeout);
      updateData.timeout = !isNaN(t) && t > 0 ? t : CONFIG.DEFAULT_TIMEOUT;
    }
    if (data.expectedStatus !== undefined) {
      const exp = Number(data.expectedStatus);
      updateData.expectedStatus = !isNaN(exp) && exp > 0 ? exp : CONFIG.DEFAULT_EXPECTED_STATUS;
    }
    if (data.maxRetries !== undefined) {
      const mr = Number(data.maxRetries);
      updateData.maxRetries = !isNaN(mr) && mr > 0 ? mr : 1;
    }
    if (data.consecutiveFails !== undefined) {
      updateData.consecutiveFails = Number(data.consecutiveFails) || 0;
    }
    if (data.checkType !== undefined) updateData.checkType = data.checkType;
    if (data.globalpingType !== undefined) updateData.globalpingType = data.globalpingType;
    if (data.showUrl !== undefined) updateData.showUrl = Boolean(data.showUrl);
    if (data.keyword !== undefined) updateData.keyword = data.keyword || null;
    if (data.groupName !== undefined) updateData.groupName = data.groupName || null;
    if (data.sslCheck !== undefined) updateData.sslCheck = Boolean(data.sslCheck);
    if (data.heartbeatToken !== undefined) updateData.heartbeatToken = data.heartbeatToken;
    if (data.heartbeatInterval !== undefined) updateData.heartbeatInterval = data.heartbeatInterval ? Number(data.heartbeatInterval) : null;
    if (data.lastCheckedAt !== undefined) updateData.lastCheckedAt = data.lastCheckedAt;
    if (data.lastStatus !== undefined) updateData.lastStatus = data.lastStatus;

    if (data.headers !== undefined) {
      if (typeof data.headers === 'object') {
        updateData.headers = JSON.stringify(data.headers);
      } else if (typeof data.headers === 'string') {
        updateData.headers = data.headers.trim() || null;
      } else {
        updateData.headers = null;
      }
    }

    if (data.checkRegions !== undefined) {
      if (Array.isArray(data.checkRegions)) {
        updateData.checkRegions = JSON.stringify(data.checkRegions);
      } else if (typeof data.checkRegions === 'string') {
        updateData.checkRegions = JSON.stringify(data.checkRegions.split(',').map(s => s.trim()).filter(Boolean));
      } else {
        updateData.checkRegions = null;
      }
    }

    if (Object.keys(updateData).length > 0) {
      await this.db.update(services).set(updateData).where(eq(services.id, id));
    }
  }

  async deleteService(id: string): Promise<void> {
    await this.db.delete(services).where(eq(services.id, id));
  }
}
