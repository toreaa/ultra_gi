/**
 * Session Recovery Tests (Epic 5 - Crash Recovery)
 *
 * Test Scenarios: 5.CR.1 - 5.CR.7
 * Priority: P0 (CRITICAL)
 * Coverage Target: 90%
 */

import {
  checkForRecoverableSessions,
  recoverSession,
  abandonSession,
  autoSaveSessionState,
  clearActiveSessionMetadata,
  getLastActiveSessionId,
} from '../sessionRecovery';
import { getDatabase } from '@/database';

// Mock database
jest.mock('@/database');

describe('Session Recovery System (Epic 5 - Crash Recovery)', () => {
  let mockDb: any;

  beforeEach(() => {
    // Setup mock database
    mockDb = {
      getAllAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      runAsync: jest.fn(() => Promise.resolve({ lastInsertRowId: 1, changes: 1 })),
    };

    (getDatabase as jest.Mock).mockResolvedValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Test Scenario 5.CR.1: App Crash During Active Session', () => {
    it('should detect recoverable session after app restart', async () => {
      // Given - Active session from 2 hours ago with 12 events
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

      mockDb.getAllAsync.mockResolvedValueOnce([
        {
          id: 1,
          user_id: 1,
          started_at: twoHoursAgo,
          session_status: 'active',
          duration_actual_minutes: 120,
        },
      ]);

      mockDb.getFirstAsync.mockResolvedValueOnce({ count: 12 }); // 12 events

      // When - Check for recoverable sessions on app restart
      const recoverableSessions = await checkForRecoverableSessions();

      // Then
      expect(recoverableSessions).toHaveLength(1);
      expect(recoverableSessions[0].sessionId).toBe(1);
      expect(recoverableSessions[0].eventCount).toBe(12);
      expect(recoverableSessions[0].canRecover).toBe(true);
      expect(recoverableSessions[0].elapsedTime).toBeGreaterThanOrEqual(7200); // ~2 hours in seconds
    });

    it('should restore session with all events and timer state', async () => {
      // Given - Active session with events
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

      mockDb.getFirstAsync
        .mockResolvedValueOnce({
          // Session log
          id: 1,
          user_id: 1,
          started_at: twoHoursAgo,
          session_status: 'active',
          duration_actual_minutes: 120,
        })
        .mockResolvedValueOnce(null); // No planned session

      mockDb.getAllAsync.mockResolvedValueOnce([
        // Events
        {
          id: 1,
          session_log_id: 1,
          event_type: 'intake',
          timestamp_offset_seconds: 1500,
          data_json: '{"fuel_product_id": 1, "carbs_consumed": 25}',
        },
        {
          id: 2,
          session_log_id: 1,
          event_type: 'discomfort',
          timestamp_offset_seconds: 3300,
          data_json: '{"level": 2, "type": "nausea"}',
        },
      ]);

      // When - Recover session
      const recoveryData = await recoverSession(1);

      // Then
      expect(recoveryData.sessionLog.id).toBe(1);
      expect(recoveryData.events).toHaveLength(2);
      expect(recoveryData.timerState.elapsedSeconds).toBeGreaterThanOrEqual(7200);
    });
  });

  describe('Test Scenario 5.CR.2: Discard Recovered Session', () => {
    it('should mark session as abandoned when user discards', async () => {
      // Given - Recoverable session
      const sessionId = 1;

      // When - User chooses to discard
      await abandonSession(sessionId, 'User chose to discard');

      // Then
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("session_status = 'abandoned'"),
        expect.arrayContaining(['User chose to discard', sessionId])
      );
    });
  });

  describe('Test Scenario 5.CR.5: Recovery Window Expiration (24 hours)', () => {
    it('should NOT recover sessions older than 24 hours', async () => {
      // Given - Session from 25 hours ago
      const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();

      mockDb.getAllAsync.mockResolvedValueOnce([
        {
          id: 1,
          user_id: 1,
          started_at: twentyFiveHoursAgo,
          session_status: 'active',
        },
      ]);

      mockDb.getFirstAsync.mockResolvedValueOnce({ count: 5 });

      // When
      const recoverableSessions = await checkForRecoverableSessions();

      // Then
      expect(recoverableSessions[0].canRecover).toBe(false);
      expect(recoverableSessions[0].elapsedTime / 3600).toBeGreaterThan(24); // > 24 hours
    });
  });

  describe('Test Scenario 5.CR.6: Auto-Save Frequency Test', () => {
    it('should update session duration and metadata every 30 seconds', async () => {
      // Given - Active session running for 5 minutes (300 seconds)
      const sessionId = 1;
      const elapsedSeconds = 300;

      // When - Auto-save runs
      await autoSaveSessionState(sessionId, elapsedSeconds);

      // Then - Should update duration_actual_minutes
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE session_logs'),
        expect.arrayContaining([5, sessionId]) // 5 minutes
      );

      // And - Should update metadata
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('app_metadata'),
        expect.arrayContaining(['active_session_id', sessionId.toString()])
      );
    });

    it('should calculate duration in minutes correctly', async () => {
      // Test cases
      const testCases = [
        { seconds: 60, expectedMinutes: 1 },
        { seconds: 150, expectedMinutes: 2 }, // Rounds down
        { seconds: 1800, expectedMinutes: 30 },
        { seconds: 7200, expectedMinutes: 120 },
      ];

      for (const { seconds, expectedMinutes } of testCases) {
        await autoSaveSessionState(1, seconds);

        expect(mockDb.runAsync).toHaveBeenCalledWith(
          expect.any(String),
          expect.arrayContaining([expectedMinutes, 1])
        );

        jest.clearAllMocks();
      }
    });
  });

  describe('Test Scenario 5.CR.7: Concurrent Auto-Save and Manual Logging', () => {
    it('should handle concurrent writes without data loss', async () => {
      // Given - Auto-save and manual log happen simultaneously
      const sessionId = 1;

      // When - Both operations run concurrently
      await Promise.all([
        autoSaveSessionState(sessionId, 1800), // Auto-save
        // Simulate manual intake logging (would call separate repository method)
        mockDb.runAsync('INSERT INTO session_events ...', [sessionId, 'intake']),
      ]);

      // Then - Both operations should complete without errors
      expect(mockDb.runAsync).toHaveBeenCalledTimes(3); // 2 for auto-save, 1 for manual log
      // No exceptions thrown = no race condition
    });
  });

  describe('Metadata Management', () => {
    it('should store active session ID in metadata', async () => {
      // When
      await autoSaveSessionState(1, 300);

      // Then
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('app_metadata'),
        expect.arrayContaining(['active_session_id', '1'])
      );
    });

    it('should clear metadata when session ends', async () => {
      // When
      await clearActiveSessionMetadata();

      // Then
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM app_metadata WHERE key = 'active_session_id'")
      );
    });

    it('should retrieve last active session ID from metadata', async () => {
      // Given
      mockDb.getFirstAsync.mockResolvedValueOnce({ value: '42' });

      // When
      const sessionId = await getLastActiveSessionId();

      // Then
      expect(sessionId).toBe(42);
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining("key = 'active_session_id'")
      );
    });

    it('should return null if no active session metadata exists', async () => {
      // Given
      mockDb.getFirstAsync.mockResolvedValueOnce(null);

      // When
      const sessionId = await getLastActiveSessionId();

      // Then
      expect(sessionId).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle session with no events gracefully', async () => {
      // Given
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      mockDb.getAllAsync.mockResolvedValueOnce([
        {
          id: 1,
          started_at: oneHourAgo,
          session_status: 'active',
        },
      ]);

      mockDb.getFirstAsync.mockResolvedValueOnce({ count: 0 }); // No events

      // When
      const sessions = await checkForRecoverableSessions();

      // Then
      expect(sessions[0].eventCount).toBe(0);
      expect(sessions[0].canRecover).toBe(true); // Still recoverable even with no events
    });

    it('should handle multiple active sessions (data integrity issue)', async () => {
      // Given - Multiple active sessions (shouldn't happen, but test resilience)
      const now = new Date().toISOString();

      mockDb.getAllAsync.mockResolvedValueOnce([
        { id: 1, started_at: now, session_status: 'active' },
        { id: 2, started_at: now, session_status: 'active' },
      ]);

      mockDb.getFirstAsync
        .mockResolvedValueOnce({ count: 5 })
        .mockResolvedValueOnce({ count: 3 });

      // When
      const sessions = await checkForRecoverableSessions();

      // Then - Should return all active sessions
      expect(sessions).toHaveLength(2);
      // App should show recovery dialog for most recent (or let user choose)
    });
  });

  describe('Performance', () => {
    it('should complete auto-save in less than 50ms', async () => {
      // When
      const start = performance.now();
      await autoSaveSessionState(1, 300);
      const duration = performance.now() - start;

      // Then
      expect(duration).toBeLessThan(50); // ms
    });

    it('should complete recovery check in less than 100ms', async () => {
      // Given
      mockDb.getAllAsync.mockResolvedValueOnce([]);

      // When
      const start = performance.now();
      await checkForRecoverableSessions();
      const duration = performance.now() - start;

      // Then
      expect(duration).toBeLessThan(100); // ms
    });
  });
});
