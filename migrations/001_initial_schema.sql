-- GI Diary - Initial Schema v1.0
-- Run on first app launch

PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  weight_kg REAL,
  onboarded_at TEXT NOT NULL,
  primary_goal TEXT,
  primary_gi_issue TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_created_at ON users(created_at);

-- Programs table
CREATE TABLE IF NOT EXISTS programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER NOT NULL,
  target_audience TEXT,
  research_source TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_programs_active ON programs(is_active);

-- Program sessions table
CREATE TABLE IF NOT EXISTS program_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_id INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  session_number INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  carb_rate_g_per_hour INTEGER NOT NULL,
  intensity_zone TEXT,
  notes TEXT,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

CREATE INDEX idx_program_sessions_program ON program_sessions(program_id);
CREATE INDEX idx_program_sessions_week ON program_sessions(program_id, week_number);
CREATE UNIQUE INDEX idx_program_sessions_unique ON program_sessions(program_id, week_number, session_number);

-- Fuel products table
CREATE TABLE IF NOT EXISTS fuel_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  carbs_per_serving REAL NOT NULL,
  serving_size TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_fuel_products_user ON fuel_products(user_id);
CREATE INDEX idx_fuel_products_active ON fuel_products(user_id, deleted_at);

-- User programs table
CREATE TABLE IF NOT EXISTS user_programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  program_id INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_programs_user ON user_programs(user_id);
CREATE INDEX idx_user_programs_status ON user_programs(user_id, status);

-- Planned sessions table
CREATE TABLE IF NOT EXISTS planned_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  program_session_id INTEGER,
  planned_date TEXT NOT NULL,
  fuel_plan_json TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (program_session_id) REFERENCES program_sessions(id) ON DELETE SET NULL
);

CREATE INDEX idx_planned_sessions_user ON planned_sessions(user_id);
CREATE INDEX idx_planned_sessions_date ON planned_sessions(planned_date);

-- Session logs table
CREATE TABLE IF NOT EXISTS session_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  planned_session_id INTEGER,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_actual_minutes INTEGER,
  session_status TEXT NOT NULL DEFAULT 'active',
  post_session_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (planned_session_id) REFERENCES planned_sessions(id) ON DELETE SET NULL
);

CREATE INDEX idx_session_logs_user ON session_logs(user_id);
CREATE INDEX idx_session_logs_started ON session_logs(started_at);
CREATE INDEX idx_session_logs_status ON session_logs(session_status);

-- Session events table
CREATE TABLE IF NOT EXISTS session_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_log_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  timestamp_offset_seconds INTEGER NOT NULL,
  actual_timestamp TEXT NOT NULL,
  data_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (session_log_id) REFERENCES session_logs(id) ON DELETE CASCADE
);

CREATE INDEX idx_session_events_log ON session_events(session_log_id);
CREATE INDEX idx_session_events_type ON session_events(session_log_id, event_type);
CREATE INDEX idx_session_events_time ON session_events(session_log_id, timestamp_offset_seconds);

-- External activities table
CREATE TABLE IF NOT EXISTS external_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_log_id INTEGER NOT NULL,
  source TEXT NOT NULL,
  external_activity_id TEXT NOT NULL,
  activity_type TEXT,
  started_at_external TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  distance_meters REAL,
  timeseries_json TEXT NOT NULL,
  raw_data_json TEXT,
  imported_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (session_log_id) REFERENCES session_logs(id) ON DELETE CASCADE
);

CREATE INDEX idx_external_activities_session ON external_activities(session_log_id);
CREATE INDEX idx_external_activities_source ON external_activities(source, external_activity_id);
CREATE UNIQUE INDEX idx_external_activities_unique ON external_activities(session_log_id);

-- App metadata table
CREATE TABLE IF NOT EXISTS app_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed default program
INSERT INTO programs (name, description, duration_weeks, target_audience, research_source)
VALUES (
  '4-Week Base Carb Training',
  'Progressive carbohydrate tolerance training starting at 30g/hr, building to 60g/hr over 4 weeks.',
  4,
  'Endurance athletes new to carb training',
  'Based on Jeukendrup (2014) gut training protocols'
);

-- Seed program sessions
INSERT INTO program_sessions (program_id, week_number, session_number, duration_minutes, carb_rate_g_per_hour, intensity_zone, notes)
VALUES
  (1, 1, 1, 60, 30, 'Zone 2', 'Start easy, focus on tolerance'),
  (1, 1, 2, 60, 30, 'Zone 2', 'Repeat Week 1 Session 1'),
  (1, 2, 1, 75, 45, 'Zone 2-3', 'Increase duration and carb rate'),
  (1, 2, 2, 75, 45, 'Zone 2-3', 'Repeat Week 2 Session 1'),
  (1, 3, 1, 90, 60, 'Zone 2-3', 'Target race pace carb intake'),
  (1, 3, 2, 90, 60, 'Zone 2-3', 'Repeat Week 3 Session 1'),
  (1, 4, 1, 120, 60, 'Zone 2-3', 'Long session at race pace fueling'),
  (1, 4, 2, 120, 60, 'Zone 2-3', 'Final long session');

-- Set schema version
INSERT INTO app_metadata (key, value) VALUES ('schema_version', '1.0');

-- Mark as initialized
INSERT INTO app_metadata (key, value) VALUES ('db_initialized', 'true');
