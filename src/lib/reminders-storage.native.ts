import * as SecureStore from 'expo-secure-store';

import type { Reminder } from '@/constants/reminders';
import { readReminders, writeReminders } from '@/lib/offline-database.native';

const LEGACY_REMINDERS_KEY = 'aavie_reminders';
let writeQueue = Promise.resolve();

export async function readStoredReminders(userId: string): Promise<Reminder[]> {
  const reminders = await readReminders(userId);
  if (reminders.length > 0) return reminders;

  const legacy = await SecureStore.getItemAsync(LEGACY_REMINDERS_KEY);
  if (!legacy) return [];
  try {
    const migrated = JSON.parse(legacy) as Reminder[];
    await writeReminders(userId, migrated);
    await SecureStore.deleteItemAsync(LEGACY_REMINDERS_KEY);
    return migrated;
  } catch {
    return [];
  }
}

export function writeStoredReminders(
  userId: string,
  reminders: Reminder[],
): Promise<void> {
  writeQueue = writeQueue
    .catch(() => {})
    .then(() => writeReminders(userId, reminders));
  return writeQueue;
}
