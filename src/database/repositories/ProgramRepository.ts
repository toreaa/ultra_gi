import { Program, ProgramSession, UserProgram } from '../../types/database';
import { getDatabase } from '../index';

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
}
