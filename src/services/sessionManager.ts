/**
 * Session Manager Service
 *
 * Manages active session lifecycle including ending sessions properly.
 * Story 5.5: Avslutt økt
 *
 * Features:
 * - End active sessions with proper cleanup
 * - Update session logs with completion data
 * - Clear recovery metadata
 * - Cancel scheduled notifications
 */

import { getDatabase } from '../database';
import * as Notifications from 'expo-notifications';
import { clearActiveSessionMetadata } from './sessionRecovery';

/**
 * End an active session
 * Updates the session log, clears metadata, and cancels notifications
 *
 * @param sessionLogId - The ID of the session log to end
 * @param elapsedSeconds - Total elapsed time in seconds
 */
export async function endSession(
  sessionLogId: number,
  elapsedSeconds: number
): Promise<void> {
  console.log(`🛑 Ending session ${sessionLogId} (${elapsedSeconds}s elapsed)...`);

  const db = await getDatabase();
  const durationMinutes = Math.floor(elapsedSeconds / 60);

  try {
    // Update session log with completion data
    await db.runAsync(
      `UPDATE session_logs
       SET ended_at = datetime('now'),
           duration_actual_minutes = ?,
           session_status = 'completed'
       WHERE id = ?`,
      [durationMinutes, sessionLogId]
    );

    console.log(`✅ Session ${sessionLogId} marked as completed (${durationMinutes} minutes)`);

    // Cancel all scheduled notifications for this session
    await cancelSessionNotifications(sessionLogId);

    // Clear recovery metadata (Winston's cleanup)
    await clearActiveSessionMetadata();

    console.log(`✅ Session ${sessionLogId} cleanup complete`);
  } catch (error) {
    console.error(`❌ Failed to end session ${sessionLogId}:`, error);
    throw error;
  }
}

/**
 * Cancel all notifications associated with a session
 * This includes intake reminders and any other scheduled notifications
 *
 * @param sessionLogId - The session log ID
 */
async function cancelSessionNotifications(sessionLogId: number): Promise<void> {
  try {
    // Get all scheduled notifications
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    // Cancel notifications that match this session
    // Note: In a real implementation, we'd store notification IDs with session metadata
    // For now, we'll cancel all scheduled notifications when ending a session
    // This is safe since we only schedule notifications for active sessions
    if (scheduledNotifications.length > 0) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log(`✅ Cancelled ${scheduledNotifications.length} scheduled notifications`);
    }
  } catch (error) {
    // Don't fail session end if notification cancellation fails
    console.warn('Failed to cancel notifications:', error);
  }
}

/**
 * Get session summary data for display
 * Used in confirmation dialog and summary screen
 *
 * @param sessionLogId - The session log ID
 * @returns Session summary with counts
 */
export async function getSessionSummary(sessionLogId: number): Promise<{
  intakeCount: number;
  discomfortCount: number;
  totalCarbs: number;
}> {
  const db = await getDatabase();

  // Count intake events
  const intakeResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM session_events
     WHERE session_log_id = ? AND event_type = 'intake'`,
    [sessionLogId]
  );

  // Count discomfort events
  const discomfortResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM session_events
     WHERE session_log_id = ? AND event_type = 'discomfort'`,
    [sessionLogId]
  );

  // Calculate total carbs from intake events
  const intakeEvents = await db.getAllAsync<{ data_json: string }>(
    `SELECT data_json
     FROM session_events
     WHERE session_log_id = ? AND event_type = 'intake'`,
    [sessionLogId]
  );

  let totalCarbs = 0;
  for (const event of intakeEvents) {
    const data = JSON.parse(event.data_json);
    totalCarbs += data.carbs_amount || 0;
  }

  return {
    intakeCount: intakeResult?.count || 0,
    discomfortCount: discomfortResult?.count || 0,
    totalCarbs,
  };
}
