ALTER TABLE services ADD COLUMN check_type TEXT NOT NULL DEFAULT 'direct';
ALTER TABLE services ADD COLUMN check_regions TEXT;
ALTER TABLE services ADD COLUMN show_url INTEGER NOT NULL DEFAULT 1;
ALTER TABLE services ADD COLUMN last_checked_at INTEGER;
ALTER TABLE services ADD COLUMN last_status TEXT;

ALTER TABLE health_checks ADD COLUMN region TEXT;

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning' CHECK(severity IN ('info', 'warning', 'critical')),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
  start_at INTEGER NOT NULL,
  end_at INTEGER,
  created_at INTEGER NOT NULL
);
