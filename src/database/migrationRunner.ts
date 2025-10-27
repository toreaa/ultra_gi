/**
 * Database Migration System
 *
 * Handles versioned schema migrations for SQLite database.
 * Ensures safe, incremental updates to database schema.
 */

import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

interface Migration {
  version: number;
  name: string;
  sqlFile?: string;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
  down?: (db: SQLite.SQLiteDatabase) => Promise<void>;
}

/**
 * Get current schema version from database
 */
async function getSchemaVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  try {
    // Check if app_metadata table exists
    const tableExists = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='app_metadata'`
    );

    if (!tableExists || tableExists.count === 0) {
      return 0; // No schema yet
    }

    // Get current version
    const result = await db.getFirstAsync<{ value: string }>(
      `SELECT value FROM app_metadata WHERE key = 'schema_version'`
    );

    return result ? parseInt(result.value, 10) : 0;
  } catch (error) {
    console.warn('Failed to get schema version, assuming 0:', error);
    return 0;
  }
}

/**
 * Set schema version in database
 */
async function setSchemaVersion(
  db: SQLite.SQLiteDatabase,
  version: number
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO app_metadata (key, value, updated_at)
     VALUES ('schema_version', ?, datetime('now'))`,
    [version.toString()]
  );
}

/**
 * Load SQL from migration file
 */
async function loadMigrationSQL(filename: string): Promise<string> {
  const assetPath = `../../migrations/${filename}`;

  // In production, migrations are bundled with the app
  // For now, we'll use FileSystem to read from the migrations directory
  try {
    const migrationPath = `${FileSystem.documentDirectory}../migrations/${filename}`;
    return await FileSystem.readAsStringAsync(migrationPath);
  } catch (error) {
    console.error(`Failed to load migration file: ${filename}`, error);
    throw new Error(`Migration file not found: ${filename}`);
  }
}

/**
 * Migration definitions
 * Each migration has a version number and an "up" function
 */
const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'Initial schema',
    sqlFile: '001_initial_schema.sql',
    up: async (db: SQLite.SQLiteDatabase) => {
      console.log('Running migration 1: Initial schema');

      // For initial migration, we can inline the SQL or load from file
      // Inline version for reliability:

      await db.execAsync('PRAGMA foreign_keys = ON;');

      // Users table
      await db.execAsync(`
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
        CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
      `);

      // Programs table
      await db.execAsync(`
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
        CREATE INDEX IF NOT EXISTS idx_programs_active ON programs(is_active);
      `);

      // Program sessions table
      await db.execAsync(`
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
        CREATE INDEX IF NOT EXISTS idx_program_sessions_program ON program_sessions(program_id);
        CREATE INDEX IF NOT EXISTS idx_program_sessions_week ON program_sessions(program_id, week_number);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_program_sessions_unique
          ON program_sessions(program_id, week_number, session_number);
      `);

      // Fuel products table
      await db.execAsync(`
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
        CREATE INDEX IF NOT EXISTS idx_fuel_products_user ON fuel_products(user_id);
        CREATE INDEX IF NOT EXISTS idx_fuel_products_active ON fuel_products(user_id, deleted_at);
      `);

      // User programs table
      await db.execAsync(`
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
        CREATE INDEX IF NOT EXISTS idx_user_programs_user ON user_programs(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_programs_status ON user_programs(user_id, status);
      `);

      // Planned sessions table
      await db.execAsync(`
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
        CREATE INDEX IF NOT EXISTS idx_planned_sessions_user ON planned_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_planned_sessions_date ON planned_sessions(planned_date);
      `);

      // Session logs table
      await db.execAsync(`
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
        CREATE INDEX IF NOT EXISTS idx_session_logs_user ON session_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_session_logs_started ON session_logs(started_at);
        CREATE INDEX IF NOT EXISTS idx_session_logs_status ON session_logs(session_status);
      `);

      // Session events table
      await db.execAsync(`
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
        CREATE INDEX IF NOT EXISTS idx_session_events_log ON session_events(session_log_id);
        CREATE INDEX IF NOT EXISTS idx_session_events_type ON session_events(session_log_id, event_type);
        CREATE INDEX IF NOT EXISTS idx_session_events_time ON session_events(session_log_id, timestamp_offset_seconds);

        -- Composite index for common query pattern
        CREATE INDEX IF NOT EXISTS idx_session_events_composite
          ON session_events(session_log_id, event_type, timestamp_offset_seconds);
      `);

      // External activities table
      await db.execAsync(`
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
        CREATE INDEX IF NOT EXISTS idx_external_activities_session ON external_activities(session_log_id);
        CREATE INDEX IF NOT EXISTS idx_external_activities_source ON external_activities(source, external_activity_id);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_external_activities_unique ON external_activities(session_log_id);
      `);

      // App metadata table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS app_metadata (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);

      // Seed default program
      await db.runAsync(`
        INSERT INTO programs (name, description, duration_weeks, target_audience, research_source)
        VALUES (?, ?, ?, ?, ?)
      `, [
        '4-Week Base Carb Training',
        'Progressive carbohydrate tolerance training starting at 30g/hr, building to 60g/hr over 4 weeks.',
        4,
        'Endurance athletes new to carb training',
        'Based on Jeukendrup (2014) gut training protocols'
      ]);

      // Get the program ID (IMPORTANT: Don't assume ID=1)
      const program = await db.getFirstAsync<{ id: number }>(
        `SELECT id FROM programs WHERE name = '4-Week Base Carb Training'`
      );

      if (!program) {
        throw new Error('Failed to create seed program in migration 1');
      }

      // Seed program sessions with correct program_id
      const sessions = [
        [program.id, 1, 1, 60, 30, 'Zone 2', 'Start easy, focus on tolerance'],
        [program.id, 1, 2, 60, 30, 'Zone 2', 'Repeat Week 1 Session 1'],
        [program.id, 2, 1, 75, 45, 'Zone 2-3', 'Increase duration and carb rate'],
        [program.id, 2, 2, 75, 45, 'Zone 2-3', 'Repeat Week 2 Session 1'],
        [program.id, 3, 1, 90, 60, 'Zone 2-3', 'Target race pace carb intake'],
        [program.id, 3, 2, 90, 60, 'Zone 2-3', 'Repeat Week 3 Session 1'],
        [program.id, 4, 1, 120, 60, 'Zone 2-3', 'Long session at race pace fueling'],
        [program.id, 4, 2, 120, 60, 'Zone 2-3', 'Final long session'],
      ];

      for (const session of sessions) {
        await db.runAsync(`
          INSERT INTO program_sessions
            (program_id, week_number, session_number, duration_minutes, carb_rate_g_per_hour, intensity_zone, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, session);
      }

      console.log('✅ Migration 1 completed: Initial schema created');
    },

    down: async (db: SQLite.SQLiteDatabase) => {
      // Rollback: Drop all tables
      await db.execAsync(`
        DROP TABLE IF EXISTS external_activities;
        DROP TABLE IF EXISTS session_events;
        DROP TABLE IF EXISTS session_logs;
        DROP TABLE IF EXISTS planned_sessions;
        DROP TABLE IF EXISTS user_programs;
        DROP TABLE IF EXISTS fuel_products;
        DROP TABLE IF EXISTS program_sessions;
        DROP TABLE IF EXISTS programs;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS app_metadata;
      `);
    }
  },

  {
    version: 2,
    name: 'Ensure seed data exists',
    up: async (db: SQLite.SQLiteDatabase) => {
      console.log('Running migration 2: Ensure seed data exists');

      // Check if seed program already exists
      const existingProgram = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM programs WHERE name = '4-Week Base Carb Training'`
      );

      if (existingProgram && existingProgram.count > 0) {
        console.log('✅ Seed program already exists, skipping seed data');
        return;
      }

      console.log('📦 Adding missing seed data...');

      // Seed default program
      await db.runAsync(`
        INSERT INTO programs (name, description, duration_weeks, target_audience, research_source)
        VALUES (?, ?, ?, ?, ?)
      `, [
        '4-Week Base Carb Training',
        'Progressive carbohydrate tolerance training starting at 30g/hr, building to 60g/hr over 4 weeks.',
        4,
        'Endurance athletes new to carb training',
        'Based on Jeukendrup (2014) gut training protocols'
      ]);

      // Get the program ID
      const program = await db.getFirstAsync<{ id: number }>(
        `SELECT id FROM programs WHERE name = '4-Week Base Carb Training'`
      );

      if (!program) {
        throw new Error('Failed to create seed program');
      }

      // Seed program sessions
      const sessions = [
        [program.id, 1, 1, 60, 30, 'Zone 2', 'Start easy, focus on tolerance'],
        [program.id, 1, 2, 60, 30, 'Zone 2', 'Repeat Week 1 Session 1'],
        [program.id, 2, 1, 75, 45, 'Zone 2-3', 'Increase duration and carb rate'],
        [program.id, 2, 2, 75, 45, 'Zone 2-3', 'Repeat Week 2 Session 1'],
        [program.id, 3, 1, 90, 60, 'Zone 2-3', 'Target race pace carb intake'],
        [program.id, 3, 2, 90, 60, 'Zone 2-3', 'Repeat Week 3 Session 1'],
        [program.id, 4, 1, 120, 60, 'Zone 2-3', 'Long session at race pace fueling'],
        [program.id, 4, 2, 120, 60, 'Zone 2-3', 'Final long session'],
      ];

      for (const session of sessions) {
        await db.runAsync(`
          INSERT INTO program_sessions
            (program_id, week_number, session_number, duration_minutes, carb_rate_g_per_hour, intensity_zone, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, session);
      }

      console.log('✅ Migration 2 completed: Seed data ensured');
    },

    down: async (db: SQLite.SQLiteDatabase) => {
      // Remove seed data
      await db.runAsync(`DELETE FROM program_sessions WHERE program_id IN (SELECT id FROM programs WHERE name = '4-Week Base Carb Training')`);
      await db.runAsync(`DELETE FROM programs WHERE name = '4-Week Base Carb Training'`);
    }
  }
];

/**
 * Run all pending migrations
 */
export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  console.log('🔄 Checking for database migrations...');

  const currentVersion = await getSchemaVersion(db);
  console.log(`Current schema version: ${currentVersion}`);

  const pendingMigrations = MIGRATIONS.filter(m => m.version > currentVersion);

  if (pendingMigrations.length === 0) {
    console.log('✅ Database is up to date');
    return;
  }

  console.log(`Found ${pendingMigrations.length} pending migration(s)`);

  // Run migrations in a transaction
  await db.execAsync('BEGIN TRANSACTION;');

  try {
    for (const migration of pendingMigrations) {
      console.log(`Running migration ${migration.version}: ${migration.name}`);

      await migration.up(db);
      await setSchemaVersion(db, migration.version);

      console.log(`✅ Migration ${migration.version} completed`);
    }

    await db.execAsync('COMMIT;');
    console.log('✅ All migrations completed successfully');
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    console.error('❌ Migration failed, rolled back:', error);
    throw error;
  }
}

/**
 * Rollback to a specific version (for development/testing only)
 */
export async function rollbackToVersion(
  db: SQLite.SQLiteDatabase,
  targetVersion: number
): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Rollback is not allowed in production');
  }

  const currentVersion = await getSchemaVersion(db);

  if (targetVersion >= currentVersion) {
    console.log('Nothing to rollback');
    return;
  }

  const migrationsToRollback = MIGRATIONS
    .filter(m => m.version > targetVersion && m.version <= currentVersion)
    .reverse(); // Rollback in reverse order

  console.log(`Rolling back ${migrationsToRollback.length} migration(s)...`);

  await db.execAsync('BEGIN TRANSACTION;');

  try {
    for (const migration of migrationsToRollback) {
      if (!migration.down) {
        throw new Error(`Migration ${migration.version} has no rollback function`);
      }

      console.log(`Rolling back migration ${migration.version}: ${migration.name}`);
      await migration.down(db);
    }

    await setSchemaVersion(db, targetVersion);
    await db.execAsync('COMMIT;');

    console.log(`✅ Rolled back to version ${targetVersion}`);
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

/**
 * Get migration status information
 */
export async function getMigrationStatus(db: SQLite.SQLiteDatabase): Promise<{
  currentVersion: number;
  latestVersion: number;
  pendingMigrations: number;
  appliedMigrations: Migration[];
  pendingMigrationList: Migration[];
}> {
  const currentVersion = await getSchemaVersion(db);
  const latestVersion = Math.max(...MIGRATIONS.map(m => m.version));
  const appliedMigrations = MIGRATIONS.filter(m => m.version <= currentVersion);
  const pendingMigrationList = MIGRATIONS.filter(m => m.version > currentVersion);

  return {
    currentVersion,
    latestVersion,
    pendingMigrations: pendingMigrationList.length,
    appliedMigrations,
    pendingMigrationList,
  };
}
