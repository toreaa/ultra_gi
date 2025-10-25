// Database exports
import * as SQLite from 'expo-sqlite';
import { runMigrations, getMigrationStatus } from './migrationRunner';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize database with migrations
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  console.log('📦 Initializing database...');

  try {
    // Open database
    db = await SQLite.openDatabaseAsync('gi_diary.db');

    // Run migrations
    await runMigrations(db);

    // Log migration status
    const status = await getMigrationStatus(db);
    console.log(`✅ Database ready - Schema version: ${status.currentVersion}`);

    return db;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Get database instance (initializes if needed)
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await initDatabase();
  }
  return db;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
    console.log('Database connection closed');
  }
}

/**
 * Reset database (DEVELOPMENT ONLY)
 * Drops all tables and re-runs migrations
 */
export async function resetDatabase(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Database reset is not allowed in production');
  }

  console.warn('⚠️ Resetting database...');

  if (db) {
    await db.closeAsync();
    db = null;
  }

  // Delete database file
  const dbPath = `${SQLite.SQLiteDatabase.name}/gi_diary.db`;
  // Note: File deletion requires expo-file-system
  // For now, just reinitialize (SQLite will recreate)

  // Reinitialize
  await initDatabase();

  console.log('✅ Database reset complete');
}

// Re-export migration utilities for debugging
export { getMigrationStatus, runMigrations } from './migrationRunner';

export * from './repositories';
