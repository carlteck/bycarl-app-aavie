import type { Reminder } from '@/constants/reminders';
import { syncStore } from './sync-store';

export async function readStoredReminders(userId: string): Promise<Reminder[]> {
  return (await syncStore.read(userId, 'reminder')).map(
    (row) => row.payload as Reminder,
  );
}
export async function writeStoredReminders(
  userId: string,
  reminders: Reminder[],
): Promise<void> {
  const existing = await readStoredReminders(userId);
  for (const reminder of reminders) {
    if (
      JSON.stringify(existing.find((row) => row.id === reminder.id)) !==
      JSON.stringify(reminder)
    ) {
      await syncStore.change(userId, 'reminder', reminder.id, () => reminder);
    }
  }
  for (const reminder of existing) {
    if (!reminders.some((row) => row.id === reminder.id))
      await syncStore.change(userId, 'reminder', reminder.id, () => null);
  }
}
