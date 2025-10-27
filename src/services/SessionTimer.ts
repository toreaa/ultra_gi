/**
 * SessionTimer
 *
 * Manages foreground timer for active workout sessions.
 * Based on Winston's Hybrid Approach from EPIC5_BACKGROUND_TIMER_POC.md
 *
 * Features:
 * - Foreground notification (keeps app alive, cannot be dismissed)
 * - Updates notification every 10 seconds (battery optimization)
 * - Auto-saves duration to database every 10 seconds (crash recovery)
 * - UI updates via callback every 1 second (smooth timer display)
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { SessionLogRepository } from '../database/repositories/SessionLogRepository';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export class SessionTimer {
  private intervalId: NodeJS.Timeout | null = null;
  private uiIntervalId: NodeJS.Timeout | null = null;
  private sessionLogId!: number; // Initialized in start()
  private startTime!: Date; // Initialized in start()
  private onTick?: (elapsedSeconds: number) => void;

  /**
   * Start the session timer
   * @param sessionLogId - ID of the session log in database
   * @param onTick - Optional callback for UI updates (called every 1 second)
   */
  async start(sessionLogId: number, onTick?: (elapsedSeconds: number) => void) {
    this.sessionLogId = sessionLogId;
    this.startTime = new Date();
    this.onTick = onTick;

    // Request notification permissions (Android)
    if (Platform.OS === 'android') {
      await Notifications.requestPermissionsAsync();
      await this.setupNotificationChannel();
    }

    // Create initial foreground notification
    await this.createForegroundNotification();

    // Update notification + auto-save every 10 seconds (battery optimization)
    this.intervalId = setInterval(async () => {
      const elapsed = this.getElapsedSeconds();
      await this.updateNotification(elapsed);
      await this.autoSave(elapsed);
    }, 10000);

    // Update UI every 1 second (smooth timer display)
    if (onTick) {
      this.uiIntervalId = setInterval(() => {
        const elapsed = this.getElapsedSeconds();
        onTick(elapsed);
      }, 1000);
    }

    console.log(`SessionTimer started for session ${sessionLogId}`);
  }

  /**
   * Stop the session timer
   */
  async stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.uiIntervalId) {
      clearInterval(this.uiIntervalId);
      this.uiIntervalId = null;
    }

    // Dismiss foreground notification
    await Notifications.dismissAllNotificationsAsync();

    console.log(`SessionTimer stopped for session ${this.sessionLogId}`);
  }

  /**
   * Get current elapsed time in seconds
   */
  private getElapsedSeconds(): number {
    return Math.floor((Date.now() - this.startTime.getTime()) / 1000);
  }

  /**
   * Format seconds to HH:MM:SS
   */
  private formatTime(elapsedSeconds: number): string {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Setup Android notification channel (required for foreground service)
   */
  private async setupNotificationChannel() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('active-session', {
        name: 'Aktiv �kt',
        importance: Notifications.AndroidImportance.HIGH,
        enableVibrate: false,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }
  }

  /**
   * Create initial foreground notification
   */
  private async createForegroundNotification() {
    await Notifications.scheduleNotificationAsync({
      identifier: 'active-session-timer',
      content: {
        title: '<� �kt-modus aktiv',
        body: '00:00:00',
        sticky: true, // Cannot be dismissed (foreground service)
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { sessionLogId: this.sessionLogId },
      },
      trigger: null, // Immediate
    });
  }

  /**
   * Update foreground notification with current timer
   * Called every 10 seconds
   */
  private async updateNotification(elapsedSeconds: number) {
    const timerText = this.formatTime(elapsedSeconds);

    await Notifications.scheduleNotificationAsync({
      identifier: 'active-session-timer',
      content: {
        title: '<� �kt-modus aktiv',
        body: timerText,
        sticky: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { sessionLogId: this.sessionLogId, elapsed: elapsedSeconds },
      },
      trigger: null,
    });
  }

  /**
   * Auto-save session duration to database
   * Called every 10 seconds (crash recovery)
   */
  private async autoSave(elapsedSeconds: number) {
    try {
      const minutes = Math.floor(elapsedSeconds / 60);
      await SessionLogRepository.updateDuration(this.sessionLogId, minutes);
      console.log(`Auto-save: ${minutes} minutes`);
    } catch (error) {
      console.error('SessionTimer.autoSave failed:', error);
    }
  }

  /**
   * Get current elapsed time (for external access)
   */
  getCurrentElapsedSeconds(): number {
    return this.getElapsedSeconds();
  }
}
