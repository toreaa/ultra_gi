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
 * Repository for SessionLog-related database operations
 */
export class SessionLogRepository {
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
