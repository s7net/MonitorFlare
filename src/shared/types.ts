export interface Env {
  DB: D1Database;
  ADMIN_PASSWORD?: string;
  ADMIN_PASSWORD_HASH?: string;
  SESSION_SECRET?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  TELEGRAM_BACKUP_CHAT_ID?: string;
  CORS_PROXY_URL?: string;
}

export type CheckType = 'direct' | 'globalping' | 'heartbeat';
export type GlobalpingType = 'http' | 'ping';

export interface Service {
  id: string;
  name: string;
  url: string;
  method: string;
  timeout: number;
  expectedStatus: number;
  checkType: CheckType;
  globalpingType?: GlobalpingType;
  checkRegions: string[] | null;
  showUrl: boolean;
  headers?: Record<string, string> | string | null;
  keyword?: string | null;
  groupName?: string | null;
  sslCheck?: boolean;
  heartbeatToken?: string | null;
  heartbeatInterval?: number | null;
  maxRetries?: number;
  consecutiveFails?: number;
  lastCheckedAt?: Date | null;
  lastStatus?: 'healthy' | 'unhealthy' | null;
  createdAt: Date;
}

export interface CreateServiceDTO {
  name: string;
  url: string;
  method?: string;
  timeout?: number;
  expectedStatus?: number;
  checkType?: CheckType;
  globalpingType?: GlobalpingType;
  checkRegions?: string[] | string | null;
  showUrl?: boolean;
  headers?: Record<string, string> | string | null;
  keyword?: string | null;
  groupName?: string | null;
  sslCheck?: boolean;
  heartbeatToken?: string | null;
  heartbeatInterval?: number | null;
  maxRetries?: number;
  consecutiveFails?: number;
}

export interface HealthCheck {
  id: string;
  serviceId: string;
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  statusCode?: number | null; 
  error?: string | null;
  region?: string | null;
  timestamp: Date;
}

export interface Notification {
  id: string;
  type: 'telegram' | 'slack' | 'discord' | 'webhook';
  enabled: boolean;
  config: Record<string, any>;
  createdAt: Date;
}

export interface TelegramConfig {
  botToken?: string;
  chatId?: string;
  backupChatId?: string;
}

export interface SlackConfig {
  webhookUrl: string;
}

export interface DiscordConfig {
  webhookUrl: string;
}

export interface CustomWebhookConfig {
  webhookUrl: string;
  secretHeader?: string;
}

export interface Incident {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  isActive: boolean;
  startAt: Date;
  endAt?: Date | null;
  createdAt: Date;
}

export interface CreateIncidentDTO {
  title: string;
  message: string;
  severity?: 'info' | 'warning' | 'critical';
  isActive?: boolean;
  startAt?: string | Date;
  endAt?: string | Date | null;
}

export interface SystemSettings {
  brandName: string;
  brandLogoUrl: string;
  brandColor: string;
  downTemplate: string;
  recoveryTemplate: string;
  checkInterval: number;
  autoBackupTelegram: boolean;
  autoBackupIntervalDays: number;
  autoBackupBotToken?: string;
  autoBackupChatId?: string;
  lastBackupAt?: string | null;
  customCss?: string;
  customJs?: string;
  totpEnabled?: boolean;
  totpSecret?: string;
  // Stored in DB (not wrangler.toml)
  adminUsername?: string;
  adminPasswordHash?: string;
  adminPanelPath?: string;
  baseUrl?: string;
  cfApiToken?: string;
  cfAccountId?: string;
  cfWorkerName?: string;
  corsProxyUrl?: string;
  autoUpdateGithub?: boolean;
}
