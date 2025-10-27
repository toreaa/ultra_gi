import { SessionLog, SessionEvent } from '../../types/database';
import { getDatabase } from '../index';

/**
 * Session with aggregated statistics (Story 7.3)
 */
export interface SessionWithStats {
  id: number;
  started_at: string;
  ended_at: string | null;
  duration_actual_minutes: number;
  planned_session_id: number | null;
  carb_rate_per_hour: number;
  total_carbs: number;
  intake_count: number;
  discomfort_count: number;
  avg_discomfort: number | null;
  post_session_notes: string | null;
}

/**
 * Completed session data with program_session_id
 */
export interface CompletedSessionData {
  program_session_id: number;
  log_id: number | null;
  session_status: string | null;
  created_at: string | null;
}

/**
 * Data for creating a new session log
 */
export interface CreateSessionLogData {
  user_id: number;
  planned_session_id?: number;
  started_at: string;
  session_status: 'active' | 'completed' | 'abandoned';
}

/**
 * Repository for SessionLog-related database operations
 */
export class SessionLogRepository {
  /**
   * Create a new session log
   * Used when starting a new active session (Story 5.1)
   * @param data - Session log data
   * @returns Session log ID
   */
  static async create(data: CreateSessionLogData): Promise<number> {
    try {
      const db = await getDatabase();
      const result = await db.runAsync(
        `INSERT INTO session_logs
         (user_id, planned_session_id, started_at, session_status)
         VALUES (?, ?, ?, ?)`,
        [
          data.user_id,
          data.planned_session_id || null,
          data.started_at,
          data.session_status
        ]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('SessionLogRepository.create failed:', error);
      throw error;
    }
  }

  /**
   * Get session log by ID
   * @param id - Session log ID
   * @returns Session log or null
   */
  static async getById(id: number): Promise<SessionLog | null> {
    try {
      const db = await getDatabase();
      const result = await db.getFirstAsync<SessionLog>(
        'SELECT * FROM session_logs WHERE id = ?',
        [id]
      );
      return result || null;
    } catch (error) {
      console.error('SessionLogRepository.getById failed:', error);
      throw error;
    }
  }

  /**
   * Update session duration (auto-save during active session)
   * Called every 10 seconds by SessionTimer (Story 5.1)
   * @param id - Session log ID
   * @param minutes - Duration in minutes
   */
  static async updateDuration(id: number, minutes: number): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync(
        'UPDATE session_logs SET duration_actual_minutes = ? WHERE id = ?',
        [minutes, id]
      );
    } catch (error) {
      console.error('SessionLogRepository.updateDuration failed:', error);
      throw error;
    }
  }

  /**
   * Get active session for a user (if any)
   * @param userId - User ID
   * @returns Active session or null
   */
  static async getActiveSession(userId: number): Promise<SessionLog | null> {
    try {
      const db = await getDatabase();
      const result = await db.getFirstAsync<SessionLog>(
        `SELECT * FROM session_logs
         WHERE user_id = ? AND session_status = 'active'
         ORDER BY started_at DESC
         LIMIT 1`,
        [userId]
      );
      return result || null;
    } catch (error) {
      console.error('SessionLogRepository.getActiveSession failed:', error);
      throw error;
    }
  }

  /**
   * End session (Story 5.5)
   * @param id - Session log ID
   * @param endedAt - End timestamp
   * @param status - Final status ('completed' or 'abandoned')
   */
  static async endSession(
    id: number,
    endedAt: string,
    status: 'completed' | 'abandoned'
  ): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync(
        `UPDATE session_logs
         SET ended_at = ?, session_status = ?
         WHERE id = ?`,
        [endedAt, status, id]
      );
    } catch (error) {
      console.error('SessionLogRepository.endSession failed:', error);
      throw error;
    }
  }

  /**
   * Update post-session notes (Story 5.5)
   * @param id - Session log ID
   * @param notes - Post-session notes
   */
  static async updateNotes(id: number, notes: string): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync(
        `UPDATE session_logs
         SET post_session_notes = ?
         WHERE id = ?`,
        [notes, id]
      );
    } catch (error) {
      console.error('SessionLogRepository.updateNotes failed:', error);
      throw error;
    }
  }

  /**
   * Get completed sessions for a specific user program
   * Used to show which program sessions have been completed
   */
  static async getCompletedByProgram(
    programId: number,
    userProgramId?: number
  ): Promise<CompletedSessionData[]> {
    try {
      const db = await getDatabase();

      // For now, we only check against program_id
      // When user_program tracking is added to session_logs, include userProgramId filter
      const sessions = await db.getAllAsync<CompletedSessionData>(
        `SELECT ps.id as program_session_id, sl.id as log_id, sl.session_status, sl.created_at
         FROM program_sessions ps
         LEFT JOIN session_logs sl ON sl.planned_session_id = ps.id
           AND sl.session_status = 'completed'
         WHERE ps.program_id = ?`,
        [programId]
      );

      return sessions || [];
    } catch (error) {
      console.error('SessionLogRepository.getCompletedByProgram failed:', error);
      throw error;
    }
  }

  /**
   * Get session with all its events (Story 7.1)
   * Returns session log and array of events
   * @param sessionLogId - Session log ID
   * @returns Object with sessionLog and events, or null
   */
  static async getSessionWithEvents(sessionLogId: number): Promise<{
    sessionLog: SessionLog;
    events: SessionEvent[];
  } | null> {
    try {
      const db = await getDatabase();

      // Get session log
      const sessionLog = await db.getFirstAsync<SessionLog>(
        'SELECT * FROM session_logs WHERE id = ?',
        [sessionLogId]
      );

      if (!sessionLog) {
        return null;
      }

      // Get session events ordered by timestamp
      const events = await db.getAllAsync<SessionEvent>(
        `SELECT * FROM session_events
         WHERE session_log_id = ?
         ORDER BY timestamp_offset_seconds ASC`,
        [sessionLogId]
      );

      return {
        sessionLog,
        events: events || [],
      };
    } catch (error) {
      console.error('SessionLogRepository.getSessionWithEvents failed:', error);
      throw error;
    }
  }

  /**
   * Get recent completed sessions (Story 7.1)
   * Used for displaying recent sessions on dashboard
   * @param userId - User ID
   * @param limit - Number of sessions to return (default 5)
   * @returns Array of completed session logs
   */
  static async getRecentCompleted(
    userId: number,
    limit: number = 5
  ): Promise<SessionLog[]> {
    try {
      const db = await getDatabase();

      const sessions = await db.getAllAsync<SessionLog>(
        `SELECT * FROM session_logs
         WHERE user_id = ? AND session_status = 'completed'
         ORDER BY ended_at DESC
         LIMIT ?`,
        [userId, limit]
      );

      return sessions || [];
    } catch (error) {
      console.error('SessionLogRepository.getRecentCompleted failed:', error);
      throw error;
    }
  }

  /**
   * Get all completed sessions with aggregated statistics (Story 7.3)
   * Used for analysis table with pattern identification
   * @param userId - User ID
   * @returns Array of sessions with stats (carb rate, discomfort, etc.)
   */
  static async getAllSessionsWithStats(
    userId: number
  ): Promise<SessionWithStats[]> {
    try {
      const db = await getDatabase();

      const sessions = await db.getAllAsync<SessionWithStats>(
        `SELECT
          sl.id,
          sl.started_at,
          sl.ended_at,
          sl.duration_actual_minutes,
          sl.planned_session_id,
          sl.post_session_notes,
          CAST(
            (SUM(CASE WHEN se.event_type = 'intake' THEN JSON_EXTRACT(se.data_json, '$.carbs_consumed') ELSE 0 END)
            / NULLIF(sl.duration_actual_minutes, 0)) * 60
            AS REAL
          ) AS carb_rate_per_hour,
          CAST(
            SUM(CASE WHEN se.event_type = 'intake' THEN JSON_EXTRACT(se.data_json, '$.carbs_consumed') ELSE 0 END)
            AS REAL
          ) AS total_carbs,
          COUNT(CASE WHEN se.event_type = 'intake' THEN 1 END) AS intake_count,
          COUNT(CASE WHEN se.event_type = 'discomfort' THEN 1 END) AS discomfort_count,
          AVG(CASE WHEN se.event_type = 'discomfort' THEN JSON_EXTRACT(se.data_json, '$.level') END) AS avg_discomfort
         FROM session_logs sl
         LEFT JOIN session_events se ON se.session_log_id = sl.id
         WHERE sl.session_status = 'completed' AND sl.user_id = ?
         GROUP BY sl.id
         ORDER BY sl.started_at DESC`,
        [userId]
      );

      return sessions || [];
    } catch (error) {
      console.error('SessionLogRepository.getAllSessionsWithStats failed:', error);
      throw error;
    }
  }
}
