import { Program, ProgramSession, UserProgram } from '../../types/database';
import { getDatabase } from '../index';

/**
 * Program progression data point (Story 7.6)
 */
export interface ProgressionDataPoint {
  session_number: number;
  week_number: number;
  planned_rate: number; // carb_rate_g_per_hour from program_session
  actual_rate: number | null; // Calculated from session_log if completed
  avg_discomfort: number | null; // Average discomfort level if completed
  is_completed: boolean;
}

/**
 * Program comparison data (Story 7.7)
 */
export interface ProgramComparisonData {
  program_id: number;
  program_name: string;
  total_sessions: number;
  completed_sessions: number;
  completion_rate: number;
  avg_discomfort: number | null;
  avg_carb_rate: number;
  success_rate: number; // % sessions with no discomfort
  progression: ProgressionDataPoint[];
}

/**
 * Repository for Program-related database operations
 */
export class ProgramRepository {
  /**
   * Get a program by ID
   */
  static async getById(id: number): Promise<Program | null> {
    try {
      const db = await getDatabase();
      const result = await db.getFirstAsync<Program>(
        'SELECT * FROM programs WHERE id = ? AND is_active = 1',
        [id]
      );
      return result || null;
    } catch (error) {
      console.error('ProgramRepository.getById failed:', error);
      throw error;
    }
  }

  /**
   * Get all active programs
   */
  static async getAll(): Promise<Program[]> {
    try {
      const db = await getDatabase();
      const programs = await db.getAllAsync<Program>(
        'SELECT * FROM programs WHERE is_active = 1 ORDER BY created_at DESC'
      );
      return programs || [];
    } catch (error) {
      console.error('ProgramRepository.getAll failed:', error);
      throw error;
    }
  }

  /**
   * Get program sessions for a specific program
   */
  static async getProgramSessions(programId: number): Promise<ProgramSession[]> {
    try {
      const db = await getDatabase();
      const sessions = await db.getAllAsync<ProgramSession>(
        `SELECT * FROM program_sessions
         WHERE program_id = ?
         ORDER BY week_number, session_number`,
        [programId]
      );
      return sessions || [];
    } catch (error) {
      console.error('ProgramRepository.getProgramSessions failed:', error);
      throw error;
    }
  }

  /**
   * Get a single program session by ID
   */
  static async getSessionById(sessionId: number): Promise<ProgramSession | null> {
    try {
      const db = await getDatabase();
      const session = await db.getFirstAsync<ProgramSession>(
        `SELECT * FROM program_sessions WHERE id = ?`,
        [sessionId]
      );
      return session || null;
    } catch (error) {
      console.error('ProgramRepository.getSessionById failed:', error);
      throw error;
    }
  }

  /**
   * Start a program for a user
   * Creates a record in user_programs table
   */
  static async startProgram(
    programId: number,
    userId: number = 1
  ): Promise<number> {
    try {
      const db = await getDatabase();
      const result = await db.runAsync(
        `INSERT INTO user_programs (user_id, program_id, started_at, status)
         VALUES (?, ?, datetime('now'), 'active')`,
        [userId, programId]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('ProgramRepository.startProgram failed:', error);
      throw error;
    }
  }

  /**
   * Get user's active programs
   */
  static async getUserActivePrograms(userId: number = 1): Promise<UserProgram[]> {
    try {
      const db = await getDatabase();
      const programs = await db.getAllAsync<UserProgram>(
        `SELECT * FROM user_programs
         WHERE user_id = ? AND status = 'active'
         ORDER BY started_at DESC`,
        [userId]
      );
      return programs || [];
    } catch (error) {
      console.error('ProgramRepository.getUserActivePrograms failed:', error);
      throw error;
    }
  }

  /**
   * Get a specific user program
   */
  static async getUserProgram(
    userId: number,
    programId: number
  ): Promise<UserProgram | null> {
    try {
      const db = await getDatabase();
      const result = await db.getFirstAsync<UserProgram>(
        `SELECT * FROM user_programs
         WHERE user_id = ? AND program_id = ? AND status = 'active'`,
        [userId, programId]
      );
      return result || null;
    } catch (error) {
      console.error('ProgramRepository.getUserProgram failed:', error);
      throw error;
    }
  }

  /**
   * Complete a user program
   */
  static async completeProgram(userProgramId: number): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync(
        `UPDATE user_programs
         SET status = 'completed', completed_at = datetime('now')
         WHERE id = ?`,
        [userProgramId]
      );
    } catch (error) {
      console.error('ProgramRepository.completeProgram failed:', error);
      throw error;
    }
  }

  /**
   * Pause a user program
   */
  static async pauseProgram(userProgramId: number): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync(
        `UPDATE user_programs
         SET status = 'paused'
         WHERE id = ?`,
        [userProgramId]
      );
    } catch (error) {
      console.error('ProgramRepository.pauseProgram failed:', error);
      throw error;
    }
  }

  /**
   * Resume a paused program
   */
  static async resumeProgram(userProgramId: number): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync(
        `UPDATE user_programs
         SET status = 'active'
         WHERE id = ?`,
        [userProgramId]
      );
    } catch (error) {
      console.error('ProgramRepository.resumeProgram failed:', error);
      throw error;
    }
  }

  /**
   * Get user's paused programs
   */
  static async getUserPausedPrograms(userId: number = 1): Promise<UserProgram[]> {
    try {
      const db = await getDatabase();
      const programs = await db.getAllAsync<UserProgram>(
        `SELECT * FROM user_programs
         WHERE user_id = ? AND status = 'paused'
         ORDER BY started_at DESC`,
        [userId]
      );
      return programs || [];
    } catch (error) {
      console.error('ProgramRepository.getUserPausedPrograms failed:', error);
      throw error;
    }
  }

  /**
   * Get progression data for a program (Story 7.6)
   * Returns data for each session showing planned vs actual carb rate and discomfort
   * @param programId - Program ID
   * @returns Array of progression data points
   */
  static async getProgressionData(programId: number): Promise<ProgressionDataPoint[]> {
    try {
      const db = await getDatabase();

      const data = await db.getAllAsync<any>(
        `SELECT
          ps.session_number,
          ps.week_number,
          ps.carb_rate_g_per_hour AS planned_rate,
          CASE
            WHEN sl.id IS NOT NULL THEN
              CAST((SUM(CASE WHEN se.event_type = 'intake' THEN JSON_EXTRACT(se.data_json, '$.carbs_consumed') ELSE 0 END)
              / NULLIF(sl.duration_actual_minutes, 0)) * 60 AS REAL)
            ELSE NULL
          END AS actual_rate,
          AVG(CASE WHEN se.event_type = 'discomfort' THEN JSON_EXTRACT(se.data_json, '$.level') END) AS avg_discomfort,
          CASE WHEN sl.id IS NOT NULL THEN 1 ELSE 0 END AS is_completed
         FROM program_sessions ps
         LEFT JOIN planned_sessions pls ON pls.program_session_id = ps.id
         LEFT JOIN session_logs sl ON sl.planned_session_id = pls.id AND sl.session_status = 'completed'
         LEFT JOIN session_events se ON se.session_log_id = sl.id
         WHERE ps.program_id = ?
         GROUP BY ps.id, ps.session_number, ps.week_number, ps.carb_rate_g_per_hour
         ORDER BY ps.session_number`,
        [programId]
      );

      return (data || []).map((row) => ({
        session_number: row.session_number,
        week_number: row.week_number,
        planned_rate: row.planned_rate,
        actual_rate: row.actual_rate,
        avg_discomfort: row.avg_discomfort,
        is_completed: row.is_completed === 1,
      }));
    } catch (error) {
      console.error('ProgramRepository.getProgressionData failed:', error);
      throw error;
    }
  }

  /**
   * Get comparison data for multiple programs (Story 7.7)
   * Returns aggregate statistics and progression data for each program
   * @param programIds - Array of program IDs to compare
   * @returns Array of program comparison data
   */
  static async getComparisonData(programIds: number[]): Promise<ProgramComparisonData[]> {
    try {
      const comparisonData: ProgramComparisonData[] = [];

      for (const programId of programIds) {
        const program = await this.getById(programId);
        if (!program) continue;

        const progression = await this.getProgressionData(programId);
        const completedSessions = progression.filter((p) => p.is_completed);

        // Calculate aggregate stats
        const totalSessions = progression.length;
        const completedCount = completedSessions.length;
        const completionRate = totalSessions > 0 ? (completedCount / totalSessions) * 100 : 0;

        // Average discomfort (only completed sessions with discomfort)
        const discomfortValues = completedSessions
          .map((p) => p.avg_discomfort)
          .filter((d): d is number => d !== null);
        const avgDiscomfort = discomfortValues.length > 0
          ? discomfortValues.reduce((sum, d) => sum + d, 0) / discomfortValues.length
          : null;

        // Average carb rate (only completed sessions)
        const carbRates = completedSessions
          .map((p) => p.actual_rate)
          .filter((r): r is number => r !== null && r > 0);
        const avgCarbRate = carbRates.length > 0
          ? carbRates.reduce((sum, r) => sum + r, 0) / carbRates.length
          : 0;

        // Success rate (% sessions with no discomfort)
        const sessionsWithNoDiscomfort = completedSessions.filter(
          (p) => p.avg_discomfort === null || p.avg_discomfort === 0
        ).length;
        const successRate = completedCount > 0
          ? (sessionsWithNoDiscomfort / completedCount) * 100
          : 0;

        comparisonData.push({
          program_id: programId,
          program_name: program.name,
          total_sessions: totalSessions,
          completed_sessions: completedCount,
          completion_rate: completionRate,
          avg_discomfort: avgDiscomfort,
          avg_carb_rate: avgCarbRate,
          success_rate: successRate,
          progression,
        });
      }

      return comparisonData;
    } catch (error) {
      console.error('ProgramRepository.getComparisonData failed:', error);
      throw error;
    }
  }
}
