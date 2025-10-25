# Database Schema - GI Diary

**Version:** 1.0
**Last Updated:** 2025-10-23
**Database:** SQLite 3.x (via expo-sqlite)

---

## Overview

The GI Diary database is a **single SQLite file** stored locally on the user's device. The schema supports offline-first operation, structured data for analysis, and future extensibility.

**File Location:** `${DOCUMENT_DIRECTORY}/gi_diary.db`

---

## Design Principles

1. **Normalized structure** - Reduce redundancy, enable efficient queries
2. **JSON flexibility** - Use JSON columns for variable/complex data (fuel plans, timeseries)
3. **UTC timestamps** - All times stored in UTC, converted to local in UI
4. **Soft deletes** - Use `deleted_at` for user data (programs/sessions), allow recovery
5. **Future-proof** - Schema supports multi-user (user_id FK) even though MVP is single-user

---

## Entity Relationship Diagram

```
┌─────────────┐
│   users     │
└──────┬──────┘
       │
       │ 1:N
       ├─────────────────┬────────────────┬────────────────┐
       │                 │                │                │
       ▼                 ▼                ▼                ▼
┌──────────────┐  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│fuel_products │  │user_programs│  │planned_      │  │session_logs  │
│              │  │             │  │sessions      │  │              │
└──────────────┘  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘
                         │                │                 │
                         │ N:1            │ 1:1             │ 1:N
                         ▼                ▼                 ▼
                  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐
                  │  programs   │  │session_logs  │  │session_     │
                  │             │  │              │  │events       │
                  └──────┬──────┘  └──────┬───────┘  └─────────────┘
                         │                │
                         │ 1:N            │ 1:1 (optional)
                         ▼                ▼
                  ┌─────────────┐  ┌──────────────┐
                  │program_     │  │external_     │
                  │sessions     │  │activities    │
                  └─────────────┘  └──────────────┘
```

---

## Schema Definition (DDL)

### **1. Users Table**

Stores user profile and preferences.

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  weight_kg REAL,                    -- Used for caffeine dosage calculations
  onboarded_at TEXT NOT NULL,        -- ISO 8601 UTC timestamp
  primary_goal TEXT,                 -- e.g., "Next marathon: Oslo 2025"
  primary_gi_issue TEXT,             -- e.g., "Nausea", "Cramping", "Bloating"
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX idx_users_created_at ON users(created_at);

-- Notes:
-- - MVP supports single user (always id=1)
-- - Future: Multi-user support via user_id foreign keys in other tables
```

---

### **2. Programs Table**

Pre-defined gut training programs (e.g., "4-Week Base Program").

```sql
CREATE TABLE programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                -- e.g., "4-Week Base Carb Training"
  description TEXT,                  -- Plain text overview
  duration_weeks INTEGER NOT NULL,   -- Total program length
  target_audience TEXT,              -- e.g., "Beginners", "Marathon runners"
  research_source TEXT,              -- Citation/URL to scientific basis
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_active INTEGER NOT NULL DEFAULT 1  -- Soft delete flag
);

-- Indexes
CREATE INDEX idx_programs_active ON programs(is_active);

-- Sample Data (hardcoded in v1, migrated from JSON later):
-- INSERT INTO programs (name, description, duration_weeks, target_audience, research_source)
-- VALUES (
--   '4-Week Base Carb Training',
--   'Progressive carbohydrate tolerance training for marathon runners.',
--   4,
--   'Marathon runners with GI sensitivity',
--   'Jeukendrup, A. (2014). A step towards personalized sports nutrition.'
-- );
```

---

### **3. Program Sessions Table**

Individual sessions within a program (e.g., "Week 2, Session 3").

```sql
CREATE TABLE program_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_id INTEGER NOT NULL,
  week_number INTEGER NOT NULL,           -- 1-based (Week 1, Week 2, ...)
  session_number INTEGER NOT NULL,        -- 1-based within week (Session 1, 2, 3)
  duration_minutes INTEGER NOT NULL,      -- Expected session length
  carb_rate_g_per_hour INTEGER NOT NULL,  -- Target carb intake rate
  intensity_zone TEXT,                    -- e.g., "Zone 2", "Zone 3-4"
  notes TEXT,                             -- Instructions (e.g., "Include hills")

  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_program_sessions_program ON program_sessions(program_id);
CREATE INDEX idx_program_sessions_week ON program_sessions(program_id, week_number);

-- Composite unique constraint
CREATE UNIQUE INDEX idx_program_sessions_unique
  ON program_sessions(program_id, week_number, session_number);

-- Sample Data:
-- INSERT INTO program_sessions (program_id, week_number, session_number, duration_minutes, carb_rate_g_per_hour, intensity_zone)
-- VALUES (1, 1, 1, 60, 30, 'Zone 2');
```

---

### **4. Fuel Products Table ("Mitt Skafferi")**

User's personal fuel library.

```sql
CREATE TABLE fuel_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,  -- Future multi-user support
  name TEXT NOT NULL,                   -- e.g., "Maurten Gel 100"
  product_type TEXT NOT NULL,           -- 'gel', 'drink', 'bar', 'food'
  carbs_per_serving REAL NOT NULL,      -- Grams of carbs per unit
  serving_size TEXT,                    -- e.g., "40g packet", "500ml bottle"
  notes TEXT,                           -- Personal notes
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT,                      -- Soft delete

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_fuel_products_user ON fuel_products(user_id);
CREATE INDEX idx_fuel_products_active ON fuel_products(user_id, deleted_at);

-- Check constraint for valid product types
CREATE TRIGGER validate_fuel_product_type
BEFORE INSERT ON fuel_products
FOR EACH ROW
WHEN NEW.product_type NOT IN ('gel', 'drink', 'bar', 'food')
BEGIN
  SELECT RAISE(ABORT, 'Invalid product_type. Must be: gel, drink, bar, food');
END;
```

---

### **5. User Programs Table**

Tracks which programs a user has started.

```sql
CREATE TABLE user_programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  program_id INTEGER NOT NULL,
  started_at TEXT NOT NULL,           -- ISO 8601 UTC timestamp
  completed_at TEXT,                  -- NULL if ongoing
  status TEXT NOT NULL DEFAULT 'active',  -- 'active', 'completed', 'paused'

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_user_programs_user ON user_programs(user_id);
CREATE INDEX idx_user_programs_status ON user_programs(user_id, status);
```

---

### **6. Planned Sessions Table (Fase 1: Pre-Workout)**

User's planned workout with fuel plan.

```sql
CREATE TABLE planned_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  program_session_id INTEGER,         -- NULL if custom session
  planned_date TEXT NOT NULL,         -- ISO 8601 date (local timezone)
  fuel_plan_json TEXT NOT NULL,       -- JSON: [{fuel_product_id, quantity, timing_minutes}]
  notes TEXT,                         -- User's pre-session notes
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (program_session_id) REFERENCES program_sessions(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_planned_sessions_user ON planned_sessions(user_id);
CREATE INDEX idx_planned_sessions_date ON planned_sessions(planned_date);

-- fuel_plan_json format:
-- [
--   {
--     "fuel_product_id": 1,
--     "product_name": "Maurten Gel",  -- Denormalized for display
--     "quantity": 1,
--     "timing_minutes": 30,           -- When to consume (relative to session start)
--     "carbs_total": 25
--   },
--   { ... }
-- ]
```

---

### **7. Session Logs Table (Fase 2: During Workout)**

Actual logged workout session.

```sql
CREATE TABLE session_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  planned_session_id INTEGER,         -- NULL if unplanned/spontaneous session
  started_at TEXT NOT NULL,           -- ISO 8601 UTC timestamp (actual start)
  ended_at TEXT,                      -- NULL if ongoing
  duration_actual_minutes INTEGER,    -- Calculated from started_at/ended_at
  session_status TEXT NOT NULL DEFAULT 'active',  -- 'active', 'completed', 'abandoned'
  post_session_notes TEXT,            -- User notes after session
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (planned_session_id) REFERENCES planned_sessions(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_session_logs_user ON session_logs(user_id);
CREATE INDEX idx_session_logs_started ON session_logs(started_at);
CREATE INDEX idx_session_logs_status ON session_logs(session_status);
```

---

### **8. Session Events Table (Intake & Discomfort Logging)**

Point-in-time events during a session.

```sql
CREATE TABLE session_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_log_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,           -- 'intake' | 'discomfort' | 'note'
  timestamp_offset_seconds INTEGER NOT NULL,  -- Seconds from session start
  actual_timestamp TEXT NOT NULL,     -- ISO 8601 UTC (for absolute reference)
  data_json TEXT NOT NULL,            -- Event-specific data
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (session_log_id) REFERENCES session_logs(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_session_events_log ON session_events(session_log_id);
CREATE INDEX idx_session_events_type ON session_events(session_log_id, event_type);
CREATE INDEX idx_session_events_time ON session_events(session_log_id, timestamp_offset_seconds);

-- data_json format by event_type:

-- event_type = 'intake':
-- {
--   "fuel_product_id": 1,
--   "product_name": "Maurten Gel",
--   "quantity": 1,
--   "carbs_consumed": 25,
--   "was_planned": true  -- true if from fuel_plan, false if ad-hoc
-- }

-- event_type = 'discomfort':
-- {
--   "level": 4,          -- 1-5 scale
--   "type": "nausea",    -- Optional: "nausea", "cramping", "bloating", "other"
--   "notes": "Sharp pain in stomach"
-- }

-- event_type = 'note':
-- {
--   "text": "Felt great, strong pace"
-- }

-- Validation trigger
CREATE TRIGGER validate_session_event_type
BEFORE INSERT ON session_events
FOR EACH ROW
WHEN NEW.event_type NOT IN ('intake', 'discomfort', 'note')
BEGIN
  SELECT RAISE(ABORT, 'Invalid event_type. Must be: intake, discomfort, note');
END;
```

---

### **9. External Activities Table (Strava/Garmin Integration)**

Imported workout data from third-party platforms.

```sql
CREATE TABLE external_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_log_id INTEGER NOT NULL,
  source TEXT NOT NULL,               -- 'strava' | 'garmin'
  external_activity_id TEXT NOT NULL, -- ID from external platform
  activity_type TEXT,                 -- 'Run', 'Ride', etc.
  started_at_external TEXT NOT NULL,  -- ISO 8601 UTC (from Strava/Garmin)
  duration_seconds INTEGER NOT NULL,
  distance_meters REAL,
  timeseries_json TEXT NOT NULL,      -- {heart_rate: [...], elevation: [...], timestamps: [...]}
  raw_data_json TEXT,                 -- Full API response (for debugging)
  imported_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (session_log_id) REFERENCES session_logs(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_external_activities_session ON external_activities(session_log_id);
CREATE INDEX idx_external_activities_source ON external_activities(source, external_activity_id);

-- Unique constraint: One external activity per session log
CREATE UNIQUE INDEX idx_external_activities_unique
  ON external_activities(session_log_id);

-- timeseries_json format:
-- {
--   "timestamps": [0, 1, 2, 3, ...],      -- Seconds from session start
--   "heart_rate": [120, 125, 130, ...],   -- BPM (null if no HR data)
--   "elevation": [100, 102, 105, ...],    -- Meters (null if flat/no data)
--   "speed": [3.5, 3.6, 3.7, ...],        -- m/s (optional)
--   "cadence": [180, 182, 178, ...]       -- steps/min (optional)
-- }
```

---

### **10. App Metadata Table**

Store app-level settings and state.

```sql
CREATE TABLE app_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sample metadata keys:
-- INSERT INTO app_metadata (key, value) VALUES
-- ('schema_version', '1.0'),
-- ('last_backup_at', '2025-10-23T10:00:00Z'),
-- ('onboarding_completed', 'true'),
-- ('strava_connected', 'false');
```

---

## Migrations Strategy

### **Initial Schema (v1.0)**

```sql
-- migrations/001_initial_schema.sql
-- Run this on first app launch

PRAGMA foreign_keys = ON;

-- Execute all CREATE TABLE statements above
-- ...

-- Seed default program (4-Week Base)
INSERT INTO programs (name, description, duration_weeks, target_audience, research_source)
VALUES (
  '4-Week Base Carb Training',
  'Progressive carbohydrate tolerance training starting at 30g/hr.',
  4,
  'Endurance athletes new to carb training',
  'Based on Jeukendrup (2014) gut training protocols'
);

-- Seed program sessions (Week 1-4 example)
INSERT INTO program_sessions (program_id, week_number, session_number, duration_minutes, carb_rate_g_per_hour, intensity_zone)
VALUES
  (1, 1, 1, 60, 30, 'Zone 2'),
  (1, 1, 2, 60, 30, 'Zone 2'),
  (1, 2, 1, 75, 45, 'Zone 2-3'),
  (1, 2, 2, 75, 45, 'Zone 2-3'),
  (1, 3, 1, 90, 60, 'Zone 2-3'),
  (1, 3, 2, 90, 60, 'Zone 2-3'),
  (1, 4, 1, 120, 60, 'Zone 2-3'),
  (1, 4, 2, 120, 60, 'Zone 2-3');

-- Set schema version
INSERT INTO app_metadata (key, value) VALUES ('schema_version', '1.0');
```

### **Future Migrations**

Create migration files:
- `migrations/002_add_xyz_feature.sql`
- Track applied migrations in `app_metadata` table
- Run pending migrations on app start

---

## Sample Queries

### **Get User's Fuel Library**
```sql
SELECT * FROM fuel_products
WHERE user_id = 1 AND deleted_at IS NULL
ORDER BY product_type, name;
```

### **Get Active Program Sessions**
```sql
SELECT ps.*, p.name as program_name
FROM program_sessions ps
JOIN programs p ON ps.program_id = p.id
WHERE p.is_active = 1
ORDER BY ps.week_number, ps.session_number;
```

### **Get Session Log with Events**
```sql
-- Main session
SELECT * FROM session_logs WHERE id = ?;

-- Events (intake + discomfort)
SELECT
  event_type,
  timestamp_offset_seconds,
  actual_timestamp,
  data_json
FROM session_events
WHERE session_log_id = ?
ORDER BY timestamp_offset_seconds;
```

### **Correlate Session with Strava Data**
```sql
SELECT
  sl.id,
  sl.started_at,
  sl.duration_actual_minutes,
  ea.timeseries_json,
  ea.source
FROM session_logs sl
LEFT JOIN external_activities ea ON sl.id = ea.session_log_id
WHERE sl.id = ?;
```

### **Analyze Discomfort Patterns**
```sql
-- Find all discomfort events with level >= 3
SELECT
  se.actual_timestamp,
  se.timestamp_offset_seconds,
  json_extract(se.data_json, '$.level') as discomfort_level,
  json_extract(se.data_json, '$.type') as discomfort_type,
  sl.started_at as session_start
FROM session_events se
JOIN session_logs sl ON se.session_log_id = sl.id
WHERE se.event_type = 'discomfort'
  AND json_extract(se.data_json, '$.level') >= 3
ORDER BY se.actual_timestamp DESC;
```

---

## Data Lifecycle

### **User Onboarding (Epic 1)**
1. INSERT into `users` table
2. Set `app_metadata.onboarding_completed = true`

### **Session Planning (Epic 4)**
1. User selects `program_session_id` or creates custom
2. App generates `fuel_plan_json` based on fuel library
3. INSERT into `planned_sessions`

### **During Workout (Epic 5)**
1. User starts session → INSERT into `session_logs` (status='active')
2. User logs intake/discomfort → INSERT into `session_events`
3. User ends session → UPDATE `session_logs` SET ended_at, status='completed'

### **Post-Workout (Epic 7)**
1. (Optional) Fetch Strava activity → INSERT into `external_activities`
2. App correlates `session_events` with `timeseries_json`
3. Generate insights, display analysis

### **Data Retention**
- **Sessions:** Keep forever (users want historical data)
- **Deleted products:** Soft delete (preserve referential integrity)
- **Old programs:** Soft delete (`is_active=0`)

---

## Backup & Export

### **Local Backup**
```javascript
// Export entire database to JSON
const backup = {
  users: await db.getAllAsync('SELECT * FROM users'),
  fuel_products: await db.getAllAsync('SELECT * FROM fuel_products WHERE deleted_at IS NULL'),
  session_logs: await db.getAllAsync('SELECT * FROM session_logs'),
  session_events: await db.getAllAsync('SELECT * FROM session_events'),
  // ... etc
};

// Save to device filesystem
await FileSystem.writeAsStringAsync(
  `${DOCUMENT_DIRECTORY}/gi_diary_backup_${timestamp}.json`,
  JSON.stringify(backup)
);
```

### **Data Portability (GDPR)**
Users can export:
- Full database JSON
- CSV of sessions
- Share via `expo-sharing`

---

## Performance Considerations

### **Indexes**
- All foreign keys have indexes
- Common query patterns covered (user_id, date ranges, status)

### **Query Optimization**
- Use prepared statements (parameterized queries)
- Batch inserts for session events (every 30s buffer)
- VACUUM database monthly (defragment)

### **Storage Estimates**
- Empty schema: ~50 KB
- 100 sessions + 1000 events: ~500 KB
- 500 sessions + 5000 events: ~2-3 MB
- Strava timeseries (100 sessions): ~5-10 MB

**Total estimated: < 15 MB for 1 year of heavy use**

---

## Security Notes

### **Sensitive Data**
- OAuth tokens → **expo-secure-store** (NOT in SQLite)
- User weight/health data → SQLite (plaintext MVP)
- Future: Enable SQLCipher for database encryption

### **SQL Injection Protection**
- Always use parameterized queries
- Never concatenate user input into SQL strings

```javascript
// GOOD
await db.runAsync('INSERT INTO fuel_products (name, carbs_per_serving) VALUES (?, ?)',
  [productName, carbs]);

// BAD (DO NOT DO THIS)
await db.runAsync(`INSERT INTO fuel_products (name) VALUES ('${productName}')`);
```

---

## Testing Data (Seed for Development)

```sql
-- migrations/seed_dev_data.sql

-- Test user
INSERT INTO users (id, name, weight_kg, onboarded_at, primary_goal, primary_gi_issue)
VALUES (1, 'Test Runner', 75, datetime('now'), 'Sub-3 marathon', 'Nausea');

-- Sample fuel products
INSERT INTO fuel_products (user_id, name, product_type, carbs_per_serving, serving_size)
VALUES
  (1, 'Maurten Gel 100', 'gel', 25, '40g packet'),
  (1, 'Precision Fuel 30', 'drink', 30, '500ml bottle'),
  (1, 'Clif Bar', 'bar', 44, '68g bar'),
  (1, 'Banana', 'food', 27, 'Medium banana');

-- Start a program
INSERT INTO user_programs (user_id, program_id, started_at)
VALUES (1, 1, datetime('now', '-7 days'));
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-23 | Initial schema definition |

---

## References

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [SQLite Best Practices](https://www.sqlite.org/lang.html)
