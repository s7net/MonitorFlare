import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const services = sqliteTable('services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  method: text('method').notNull().default('GET'),
  timeout: integer('timeout').notNull().default(10000),
  expectedStatus: integer('expected_status').notNull().default(200),
  checkType: text('check_type').notNull().default('direct'),
  globalpingType: text('globalping_type').notNull().default('http'),
  checkRegions: text('check_regions'),
  showUrl: integer('show_url', { mode: 'boolean' }).notNull().default(true),
  headers: text('headers'),
  keyword: text('keyword'),
  groupName: text('group_name'),
  sslCheck: integer('ssl_check', { mode: 'boolean' }).notNull().default(false),
  heartbeatToken: text('heartbeat_token'),
  heartbeatInterval: integer('heartbeat_interval'),
  maxRetries: integer('max_retries').notNull().default(1),
  consecutiveFails: integer('consecutive_fails').notNull().default(0),
  lastCheckedAt: integer('last_checked_at', { mode: 'timestamp' }),
  lastStatus: text('last_status'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const healthChecks = sqliteTable('health_checks', {
  id: text('id').primaryKey(),
  serviceId: text('service_id')
    .notNull()
    .references(() => services.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['healthy', 'unhealthy'] }).notNull(),
  responseTime: integer('response_time').notNull(),
  statusCode: integer('status_code'),
  error: text('error'),
  region: text('region'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['telegram', 'slack', 'discord', 'webhook'] }).notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  config: text('config').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const incidents = sqliteTable('incidents', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  severity: text('severity', { enum: ['info', 'warning', 'critical'] }).notNull().default('warning'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  startAt: integer('start_at', { mode: 'timestamp' }).notNull(),
  endAt: integer('end_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
