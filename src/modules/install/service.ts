import type { D1Database } from '@cloudflare/workers-types';

export class InstallService {
  constructor(private db: D1Database) {}

  /**
   * Checks whether MonitorFlare is installed by reading the settings table.
   */
  async isInstalled(): Promise<boolean> {
    try {
      const stmt = this.db.prepare("SELECT value FROM settings WHERE key = 'installed'");
      const result = await stmt.first<{ value: string }>();
      return result?.value === '1';
    } catch {
      // If table doesn't exist yet, it's not installed
      return false;
    }
  }

  /**
   * Automatically bootstraps all D1 database tables and missing columns.
   */
  async bootstrapDatabase(): Promise<void> {
    // 1. Services Table
    await this.db.prepare(`
      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        method TEXT DEFAULT 'GET' NOT NULL,
        timeout INTEGER DEFAULT 10000 NOT NULL,
        expected_status INTEGER DEFAULT 200 NOT NULL,
        created_at INTEGER NOT NULL,
        check_type TEXT NOT NULL DEFAULT 'direct',
        check_regions TEXT,
        show_url INTEGER NOT NULL DEFAULT 1,
        last_checked_at INTEGER,
        last_status TEXT,
        globalping_type TEXT NOT NULL DEFAULT 'http',
        headers TEXT,
        keyword TEXT,
        group_name TEXT,
        ssl_check INTEGER NOT NULL DEFAULT 0,
        heartbeat_token TEXT,
        heartbeat_interval INTEGER,
        max_retries INTEGER NOT NULL DEFAULT 1,
        consecutive_fails INTEGER NOT NULL DEFAULT 0
      )
    `).run();

    // Safely add any columns if upgrading existing table
    const safeAddColumns = [
      "ALTER TABLE services ADD COLUMN check_type TEXT NOT NULL DEFAULT 'direct'",
      "ALTER TABLE services ADD COLUMN check_regions TEXT",
      "ALTER TABLE services ADD COLUMN show_url INTEGER NOT NULL DEFAULT 1",
      "ALTER TABLE services ADD COLUMN last_checked_at INTEGER",
      "ALTER TABLE services ADD COLUMN last_status TEXT",
      "ALTER TABLE services ADD COLUMN globalping_type TEXT NOT NULL DEFAULT 'http'",
      "ALTER TABLE services ADD COLUMN headers TEXT",
      "ALTER TABLE services ADD COLUMN keyword TEXT",
      "ALTER TABLE services ADD COLUMN group_name TEXT",
      "ALTER TABLE services ADD COLUMN ssl_check INTEGER NOT NULL DEFAULT 0",
      "ALTER TABLE services ADD COLUMN heartbeat_token TEXT",
      "ALTER TABLE services ADD COLUMN heartbeat_interval INTEGER",
      "ALTER TABLE services ADD COLUMN max_retries INTEGER NOT NULL DEFAULT 1",
      "ALTER TABLE services ADD COLUMN consecutive_fails INTEGER NOT NULL DEFAULT 0",
    ];

    for (const sql of safeAddColumns) {
      try {
        await this.db.prepare(sql).run();
      } catch {
        // Column already exists, ignore
      }
    }

    // 2. Health Checks Table
    await this.db.prepare(`
      CREATE TABLE IF NOT EXISTS health_checks (
        id TEXT PRIMARY KEY NOT NULL,
        service_id TEXT NOT NULL,
        status TEXT NOT NULL,
        response_time INTEGER NOT NULL,
        status_code INTEGER,
        error TEXT,
        timestamp INTEGER NOT NULL,
        region TEXT,
        FOREIGN KEY (service_id) REFERENCES services(id) ON UPDATE NO ACTION ON DELETE CASCADE
      )
    `).run();

    try {
      await this.db.prepare("ALTER TABLE health_checks ADD COLUMN region TEXT").run();
    } catch {}

    // 3. Notifications Table
    await this.db.prepare(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL,
        enabled INTEGER DEFAULT 1 NOT NULL,
        config TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `).run();

    // 4. Settings Table
    await this.db.prepare(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `).run();

    // 5. Incidents Table
    await this.db.prepare(`
      CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'warning',
        is_active INTEGER NOT NULL DEFAULT 1,
        start_at INTEGER NOT NULL,
        end_at INTEGER,
        created_at INTEGER NOT NULL
      )
    `).run();
  }

  /**
   * Saves installation settings and marks installation as complete.
   */
  async completeInstallation(settings: Record<string, string>): Promise<void> {
    await this.bootstrapDatabase();

    for (const [key, value] of Object.entries(settings)) {
      await this.db.prepare(`
        INSERT INTO settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `).bind(key, value).run();
    }

    // Mark installed flag
    await this.db.prepare(`
      INSERT INTO settings (key, value) VALUES ('installed', '1')
      ON CONFLICT(key) DO UPDATE SET value = '1'
    `).run();
  }
}
