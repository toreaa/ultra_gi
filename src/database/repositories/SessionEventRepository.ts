/**
 * SessionEventRepository
 *
 * Manages session events (intake, discomfort, notes) during active sessions.
 * Events are timestamped with offset from session start for accurate tracking.
 */

import { getDatabase } from '../index';

export interface SessionEvent {
  id: number;
  session_log_id: number;
  event_type: 'intake' | 'discomfort' | 'note';
  timestamp_offset_seconds: number;
  actual_timestamp: string;
  data_json: string; // Serialized JSON
  created_at: string;
}

export interface IntakeEventData {
  fuel_product_id: number;
  product_name: string;
  quantity: number;
  carbs_consumed: number;
  was_planned: boolean;
  timing_minute?: number; // Optional: for tracking which planned timing was used
}

export interface DiscomfortEventData {
  severity: number; // 1-5 scale
  symptoms: string[];
  notes?: string;
}

export interface NoteEventData {
  note_text: string;
}

export class SessionEventRepository {
  /**
   * Create intake event
   * @param sessionLogId - Session log ID
   * @param offsetSeconds - Elapsed seconds from session start
   * @param data - Intake event data
   * @returns Inserted event ID
   */
  static async createIntakeEvent(
    sessionLogId: number,
    offsetSeconds: number,
    data: IntakeEventData
  ): Promise<number> {
    try {
      const db = await getDatabase();
      const result = await db.runAsync(
        `INSERT INTO session_events
         (session_log_id, event_type, timestamp_offset_seconds, actual_timestamp, data_json)
         VALUES (?, 'intake', ?, datetime('now'), ?)`,
        [sessionLogId, offsetSeconds, JSON.stringify(data)]
      );
      console.log(`Created intake event: ${data.product_name} (${data.carbs_consumed}g)`);
      return result.lastInsertRowId;
    } catch (error) {
      console.error('SessionEventRepository.createIntakeEvent failed:', error);
      throw error;
    }
  }

  /**
   * Create discomfort event
   * @param sessionLogId - Session log ID
   * @param offsetSeconds - Elapsed seconds from session start
   * @param data - Discomfort event data
   * @returns Inserted event ID
   */
  static async createDiscomfortEvent(
    sessionLogId: number,
    offsetSeconds: number,
    data: DiscomfortEventData
  ): Promise<number> {
    try {
      const db = await getDatabase();
      const result = await db.runAsync(
        `INSERT INTO session_events
         (session_log_id, event_type, timestamp_offset_seconds, actual_timestamp, data_json)
         VALUES (?, 'discomfort', ?, datetime('now'), ?)`,
        [sessionLogId, offsetSeconds, JSON.stringify(data)]
      );
      console.log(`Created discomfort event: severity ${data.severity}`);
      return result.lastInsertRowId;
    } catch (error) {
      console.error('SessionEventRepository.createDiscomfortEvent failed:', error);
      throw error;
    }
  }

  /**
   * Create note event
   * @param sessionLogId - Session log ID
   * @param offsetSeconds - Elapsed seconds from session start
   * @param data - Note event data
   * @returns Inserted event ID
   */
  static async createNoteEvent(
    sessionLogId: number,
    offsetSeconds: number,
    data: NoteEventData
  ): Promise<number> {
    try {
      const db = await getDatabase();
      const result = await db.runAsync(
        `INSERT INTO session_events
         (session_log_id, event_type, timestamp_offset_seconds, actual_timestamp, data_json)
         VALUES (?, 'note', ?, datetime('now'), ?)`,
        [sessionLogId, offsetSeconds, JSON.stringify(data)]
      );
      console.log(`Created note event`);
      return result.lastInsertRowId;
    } catch (error) {
      console.error('SessionEventRepository.createNoteEvent failed:', error);
      throw error;
    }
  }

  /**
   * Get all events for a session, optionally filtered by type
   * @param sessionLogId - Session log ID
   * @param eventType - Optional event type filter
   * @returns Array of session events, ordered by timestamp offset
   */
  static async getEventsBySession(
    sessionLogId: number,
    eventType?: 'intake' | 'discomfort' | 'note'
  ): Promise<SessionEvent[]> {
    try {
      const db = await getDatabase();
      const query = eventType
        ? `SELECT * FROM session_events WHERE session_log_id = ? AND event_type = ? ORDER BY timestamp_offset_seconds ASC`
        : `SELECT * FROM session_events WHERE session_log_id = ? ORDER BY timestamp_offset_seconds ASC`;
      const params = eventType ? [sessionLogId, eventType] : [sessionLogId];
      const events = await db.getAllAsync<SessionEvent>(query, params);
      return events || [];
    } catch (error) {
      console.error('SessionEventRepository.getEventsBySession failed:', error);
      throw error;
    }
  }

  /**
   * Get intake events for a session
   * @param sessionLogId - Session log ID
   * @returns Array of intake events with parsed data
   */
  static async getIntakeEvents(sessionLogId: number): Promise<Array<SessionEvent & { parsedData: IntakeEventData }>> {
    try {
      const events = await this.getEventsBySession(sessionLogId, 'intake');
      return events.map(event => ({
        ...event,
        parsedData: JSON.parse(event.data_json) as IntakeEventData,
      }));
    } catch (error) {
      console.error('SessionEventRepository.getIntakeEvents failed:', error);
      throw error;
    }
  }

  /**
   * Delete an event (for future edit/delete functionality)
   * @param eventId - Event ID to delete
   */
  static async deleteEvent(eventId: number): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM session_events WHERE id = ?', [eventId]);
      console.log(`Deleted event ${eventId}`);
    } catch (error) {
      console.error('SessionEventRepository.deleteEvent failed:', error);
      throw error;
    }
  }
}
