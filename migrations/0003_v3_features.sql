ALTER TABLE services ADD COLUMN headers TEXT;
ALTER TABLE services ADD COLUMN keyword TEXT;
ALTER TABLE services ADD COLUMN group_name TEXT;
ALTER TABLE services ADD COLUMN ssl_check INTEGER NOT NULL DEFAULT 0;
ALTER TABLE services ADD COLUMN heartbeat_token TEXT;
ALTER TABLE services ADD COLUMN heartbeat_interval INTEGER;
