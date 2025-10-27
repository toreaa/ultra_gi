/**
 * Session Recovery Service
 *
 * Handles crash recovery for active workout sessions.
 * Critical for 2-4 hour sessions where data loss is unacceptable.
 *
 * Features:
 * - Auto-save session state every 30 seconds
 * - Detect incomplete sessions on app restart
 * - Restore timer and event log
 * - Handle interrupted sessions gracefully
 */

import { getDatabase } from '../database';
import { SessionLog, SessionEvent } from '../types/database';

export interface SessionRecoveryData {
  sessionLog: SessionLog;
  events: SessionEvent[];
  timerState: {
    startedAt: string;
    elapsedSeconds: number;
    isPaused: boolean;
    pausedAt?: string;
  };
  fuelPlan: any; // FuelPlan type from session types
}

export interface RecoverableSession {
  sessionId: number;
  startedAt: string;
  elapsedTime: number; // seconds
  eventCount: number;
  canRecover: boolean;
  recoveryData?: SessionRecoveryData;
}

/**
 * Check if there are any active (incomplete) sessions that can be recovered
 */
export async function checkForRecoverableSessions(): Promise<RecoverableSession[]> {
  const db = await getDatabase();

  // Find all sessions with status='active'
  const activeSessions = await db.getAllAsync<SessionLog>(
    `SELECT * FROM session_logs WHERE session_status = 'active' ORDER BY started_at DESC`
  );

  if (activeSessions.length === 0) {
    return [];
  }

  const recoverableSessions: RecoverableSession[] = [];

  for (const session of activeSessions) {
    // Calculate elapsed time
    const startTime = new Date(session.started_at).getTime();
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - startTime) / 1000);

    // Get event count
    const eventCount = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM session_events WHERE session_log_id = ?`,
      [session.id]
    );

    // Determine if session is recoverable
    // Sessions older than 24 hours are considered abandoned
    const MAX_RECOVERY_AGE_HOURS = 24;
    const ageHours = elapsedSeconds / 3600;
    const canRecover = ageHours < MAX_RECOVERY_AGE_HOURS;

    recoverableSessions.push({
      sessionId: session.id,
      startedAt: session.started_at,
      elapsedTime: elapsedSeconds,
      eventCount: eventCount?.count || 0,
      canRecover,
    });
  }

  return recoverableSessions;
}

/**
 * Load full recovery data for a specific session
 */
export async function loadRecoveryData(sessionId: number): Promise<SessionRecoveryData | null> {
  const db = await getDatabase();

  // Load session log
  const sessionLog = await db.getFirstAsync<SessionLog>(
    `SELECT * FROM session_logs WHERE id = ?`,
    [sessionId]
  );

  if (!sessionLog) {
    return null;
  }

  // Load all events
  const events = await db.getAllAsync<SessionEvent>(
    `SELECT * FROM session_events WHERE session_log_id = ? ORDER BY timestamp_offset_seconds ASC`,
    [sessionId]
  );

  // Load fuel plan (if session was planned)
  let fuelPlan = null;
  if (sessionLog.planned_session_id) {
    const plannedSession = await db.getFirstAsync<{ fuel_plan_json: string }>(
      `SELECT fuel_plan_json FROM planned_sessions WHERE id = ?`,
      [sessionLog.planned_session_id]
    );

    if (plannedSession) {
      fuelPlan = JSON.parse(plannedSession.fuel_plan_json);
    }
  }

  // Calculate timer state
  const startedAt = sessionLog.started_at;
  const now = new Date().toISOString();
  const elapsedSeconds = Math.floor(
    (new Date(now).getTime() - new Date(startedAt).getTime()) / 1000
  );

  return {
    sessionLog,
    events,
    timerState: {
      startedAt,
      elapsedSeconds,
      isPaused: false, // We assume session was not paused (could enhance this)
    },
    fuelPlan,
  };
}

/**
 * Recover (resume) an active session
 * Returns the session ID and recovery data
 */
export async function recoverSession(sessionId: number): Promise<SessionRecoveryData> {
  console.log(`🔄 Recovering session ${sessionId}...`);

  const recoveryData = await loadRecoveryData(sessionId);

  if (!recoveryData) {
    throw new Error(`Session ${sessionId} not found or cannot be recovered`);
  }

  console.log(`✅ Session ${sessionId} recovered - ${recoveryData.events.length} events restored`);

  return recoveryData;
}

/**
 * Abandon (discard) a session
 * Marks the session as 'abandoned' and cleans up
 */
export async function abandonSession(sessionId: number, reason?: string): Promise<void> {
  const db = await getDatabase();

  console.log(`❌ Abandoning session ${sessionId}${reason ? `: ${reason}` : ''}`);

  await db.runAsync(
    `UPDATE session_logs
     SET session_status = 'abandoned',
         ended_at = datetime('now'),
         post_session_notes = ?
     WHERE id = ?`,
    [reason || 'Session abandoned by user', sessionId]
  );

  console.log(`✅ Session ${sessionId} marked as abandoned`);
}

/**
 * Auto-save session state (called periodically during active session)
 * This ensures we can recover even if app crashes
 */
export async function autoSaveSessionState(
  sessionId: number,
  currentElapsedSeconds: number
): Promise<void> {
  const db = await getDatabase();

  // Update session with current duration
  // Note: We don't set ended_at yet (session is still active)
  await db.runAsync(
    `UPDATE session_logs
     SET duration_actual_minutes = ?
     WHERE id = ?`,
    [Math.floor(currentElapsedSeconds / 60), sessionId]
  );

  // Optional: Store additional recovery metadata
  // Could use app_metadata or a dedicated session_state table
  await db.runAsync(
    `INSERT OR REPLACE INTO app_metadata (key, value, updated_at)
     VALUES (?, ?, datetime('now'))`,
    [`active_session_id`, sessionId.toString()]
  );

  // Silent success (called frequently, don't spam logs)
}

/**
 * Clear active session metadata (called when session is properly ended)
 */
export async function clearActiveSessionMetadata(): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `DELETE FROM app_metadata WHERE key = 'active_session_id'`
  );
}

/**
 * Get the last active session ID (from metadata)
 */
export async function getLastActiveSessionId(): Promise<number | null> {
  const db = await getDatabase();

  const result = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM app_metadata WHERE key = 'active_session_id'`
  );

  return result ? parseInt(result.value, 10) : null;
}

/**
 * Smart recovery check on app startup
 * Returns the most likely session to recover, or null
 */
export async function checkForSmartRecovery(): Promise<RecoverableSession | null> {
  // First, check metadata for explicit active session
  const lastActiveId = await getLastActiveSessionId();

  if (lastActiveId) {
    const recoveryData = await loadRecoveryData(lastActiveId);
    if (recoveryData) {
      const startTime = new Date(recoveryData.sessionLog.started_at).getTime();
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const ageHours = elapsedSeconds / 3600;

      // Only auto-suggest if session is < 12 hours old
      if (ageHours < 12) {
        const eventCount = await (await getDatabase()).getFirstAsync<{ count: number }>(
          `SELECT COUNT(*) as count FROM session_events WHERE session_log_id = ?`,
          [lastActiveId]
        );

        return {
          sessionId: lastActiveId,
          startedAt: recoveryData.sessionLog.started_at,
          elapsedTime: elapsedSeconds,
          eventCount: eventCount?.count || 0,
          canRecover: true,
          recoveryData,
        };
      }
    }
  }

  // Fallback: Check for any active sessions
  const recoverableSessions = await checkForRecoverableSessions();

  // Return the most recent one that's recoverable
  const mostRecent = recoverableSessions.find(s => s.canRecover);

  if (mostRecent) {
    const recoveryData = await loadRecoveryData(mostRecent.sessionId);
    mostRecent.recoveryData = recoveryData ?? undefined;
  }

  return mostRecent ?? null;
}

/**
 * Format elapsed time for user display
 */
export function formatRecoveryTime(elapsedSeconds: number): string {
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}t ${minutes}min`;
  }
  return `${minutes}min`;
}

/**
 * Get recovery prompt message for user
 */
export function getRecoveryPromptMessage(session: RecoverableSession): string {
  const timeAgo = formatRecoveryTime(session.elapsedTime);
  const events = session.eventCount;

  return `Du har en pågående økt fra ${timeAgo} siden med ${events} loggede hendelser. Vil du fortsette?`;
}
