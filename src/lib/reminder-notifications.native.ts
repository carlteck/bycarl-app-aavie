import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import type { Reminder } from '@/constants/reminders';
import { requestDictationPermission } from '@/lib/dictation-permission';
import {
  reminderNotificationDate,
  reminderNotificationId,
} from '@/lib/reminder-notification-schedule';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const CHANNEL_ID = 'reminders';

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Échéances AAVIE',
    importance: Notifications.AndroidImportance.HIGH,
  });
}

async function ensurePermission(): Promise<boolean> {
  const result = await requestDictationPermission(
    {
      getPermissionsAsync: async () => {
        const status = await Notifications.getPermissionsAsync();
        return {
          granted: status.granted,
          canAskAgain: status.canAskAgain,
        };
      },
      requestPermissionsAsync: async () => {
        const status = await Notifications.requestPermissionsAsync();
        return {
          granted: status.granted,
          canAskAgain: status.canAskAgain,
        };
      },
    },
    () => true,
  );
  return result === 'granted';
}

export async function cancelAllReminderNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.identifier.startsWith('aavie-reminder:'))
      .map((item) =>
        Notifications.cancelScheduledNotificationAsync(item.identifier),
      ),
  );
}

export async function syncReminderNotifications(
  reminders: Reminder[],
): Promise<void> {
  const enabled = reminders.filter((reminder) => reminder.notifyEnabled);
  await cancelAllReminderNotifications();
  if (enabled.length === 0) return;
  const allowed = await ensurePermission();
  if (!allowed) return;
  await ensureAndroidChannel();
  const now = new Date();
  await Promise.all(
    enabled.map(async (reminder) => {
      const date = reminderNotificationDate(
        reminder.dateISO,
        reminder.leadDays,
        now,
      );
      if (!date) return;
      await Notifications.scheduleNotificationAsync({
        identifier: reminderNotificationId(reminder.id),
        content: {
          title: reminder.title,
          body: 'Échéance AAVIE à ne pas manquer.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date,
          channelId: CHANNEL_ID,
        },
      });
    }),
  );
}
