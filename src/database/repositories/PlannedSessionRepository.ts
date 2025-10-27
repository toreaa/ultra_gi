/**
 * PlannedSessionRepository
 *
 * Handles database operations for planned training sessions.
 * A planned session stores the nutrition plan (fuel products + timing)
 * before the user starts the actual session.
 */

import { getDatabase } from '../index';

export interface PlannedSession {
  id: number;
  user_id: number;
  program_session_id?: number;
  planned_date: string;
  fuel_plan_json: string;
  notes?: string;
  created_at: string;
}

export interface CreatePlannedSessionData {
  user_id: number;
  program_session_id?: number;
  planned_date: string;
  fuel_plan_json: string;
  notes?: string;
}

export class PlannedSessionRepository {
  /**
   * Create a new planned session
   * @param data - Planned session data
   * @returns Promise<number> - ID of created planned session
   */
  static async create(data: CreatePlannedSessionData): Promise<number> {
    const db = await getDatabase();

    const result = await db.runAsync(
      `INSERT INTO planned_sessions
       (user_id, program_session_id, planned_date, fuel_plan_json, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.user_id,
        data.program_session_id || null,
        data.planned_date,
        data.fuel_plan_json,
        data.notes || null
      ]
    );

    return result.lastInsertRowId;
  }

  /**
   * Get planned session by ID
   * @param id - Planned session ID
   * @returns Promise<PlannedSession | null>
   */
  static async getById(id: number): Promise<PlannedSession | null> {
    const db = await getDatabase();

    const result = await db.getFirstAsync<PlannedSession>(
      'SELECT * FROM planned_sessions WHERE id = ?',
      [id]
    );

    return result || null;
  }

  /**
   * Get all planned sessions for a user
   * @param userId - User ID
   * @returns Promise<PlannedSession[]>
   */
  static async getAllByUserId(userId: number): Promise<PlannedSession[]> {
    const db = await getDatabase();

    const results = await db.getAllAsync<PlannedSession>(
      'SELECT * FROM planned_sessions WHERE user_id = ? ORDER BY planned_date DESC',
      [userId]
    );

    return results || [];
  }

  /**
   * Delete planned session by ID
   * @param id - Planned session ID
   * @returns Promise<void>
   */
  static async deleteById(id: number): Promise<void> {
    const db = await getDatabase();

    await db.runAsync(
      'DELETE FROM planned_sessions WHERE id = ?',
      [id]
    );
  }
}
