/**
 * Notification Service
 *
 * Handles scheduling intake reminder notifications during active sessions.
 * Story 5.2: Varsler for inntak
 *
 * Features:
 * - Request notification permissions
 * - Schedule intake reminders based on fuel plan
 * - Cancel all scheduled notifications
 * - Configure foreground notification behavior
 */

import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform } from 'react-native';
import { FuelPlanItem } from '../types/fuelPlan';

/**
 * Configure how notifications are handled when app is in foreground
 * We want to show notifications even when app is open
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions from the user
 * Should be called before scheduling any notifications
 *
 * @returns Permission status ('granted', 'denied', or 'undetermined')
 */
export async function requestNotificationPermissions(): Promise<string> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    // If already granted, return immediately
    if (existingStatus === 'granted') {
      return 'granted';
    }

    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();

    console.log(`📱 Notification permission: ${status}`);

    return status;
  } catch (error) {
    console.error('Failed to request notification permissions:', error);
    return 'denied';
  }
}

/**
 * Schedule a single intake reminder notification
 *
 * @param timingMinutes - When to show notification (minutes from session start)
 * @param productName - Name of the fuel product
 * @param carbs - Carbs in the product
 * @param sessionStartTime - When the session started (Date object)
 * @returns Notification ID (for cancellation)
 */
export async function scheduleIntakeReminder(
  timingMinutes: number,
  productName: string,
  carbs: number,
  sessionStartTime: Date
): Promise<string | null> {
  try {
    // Calculate trigger time: sessionStartTime + timingMinutes
    const triggerTime = new Date(sessionStartTime.getTime() + timingMinutes * 60 * 1000);
    const now = new Date();

    // Don't schedule if trigger time is in the past
    if (triggerTime <= now) {
      console.log(`⏭️ Skipping past reminder at ${timingMinutes}min for ${productName}`);
      return null;
    }

    // Calculate seconds until trigger
    const secondsUntilTrigger = Math.floor((triggerTime.getTime() - now.getTime()) / 1000);

    // Schedule notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Tid for inntak',
        body: `${productName} (${carbs}g karbs)`,
        sound: true,
        data: {
          type: 'intake_reminder',
          productName,
          carbs,
          timingMinutes,
        },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntilTrigger,
      },
    });

    console.log(
      `🔔 Scheduled intake reminder at ${timingMinutes}min for ${productName} (ID: ${notificationId})`
    );

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule intake reminder:', error);
    return null;
  }
}

/**
 * Schedule all intake reminders from a fuel plan
 * Flattens timing_minutes arrays and schedules one notification per timing
 *
 * @param fuelPlan - Array of fuel plan items (from planned_session)
 * @param sessionStartTime - When the session started (Date object)
 * @returns Array of notification IDs
 */
export async function scheduleAllIntakeReminders(
  fuelPlan: FuelPlanItem[],
  sessionStartTime: Date
): Promise<string[]> {
  // Check if empty plan (spontaneous session)
  if (!fuelPlan || fuelPlan.length === 0) {
    console.log('📭 No fuel plan - skipping intake reminders');
    return [];
  }

  const notificationIds: string[] = [];

  // Flatten all timings from fuel plan
  for (const item of fuelPlan) {
    for (const timing of item.timing_minutes) {
      const notifId = await scheduleIntakeReminder(
        timing,
        item.product_name,
        item.carbs_per_serving,
        sessionStartTime
      );

      if (notifId) {
        notificationIds.push(notifId);
      }
    }
  }

  console.log(`✅ Scheduled ${notificationIds.length} intake reminders`);

  return notificationIds;
}

/**
 * Cancel all scheduled notifications
 * Called when session ends or when user wants to stop reminders
 */
export async function cancelAllReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('🔕 Cancelled all scheduled intake reminders');
  } catch (error) {
    console.error('Failed to cancel reminders:', error);
  }
}

/**
 * Get all currently scheduled notifications (for debugging)
 * @returns Array of scheduled notification objects
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`📋 ${scheduled.length} notifications currently scheduled`);
    return scheduled;
  } catch (error) {
    console.error('Failed to get scheduled notifications:', error);
    return [];
  }
}
