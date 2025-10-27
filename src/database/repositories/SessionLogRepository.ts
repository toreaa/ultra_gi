import { SessionLog } from '../../types/database';
import { getDatabase } from '../index';

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
}
