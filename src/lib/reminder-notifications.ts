import type { Reminder } from '@/constants/reminders';

/** Web : pas de notifications système. */
export async function syncReminderNotifications(
  _reminders: Reminder[],
): Promise<void> {}

export async function cancelAllReminderNotifications(): Promise<void> {}
