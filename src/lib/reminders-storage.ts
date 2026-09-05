import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { Reminder } from '@/constants/reminders';

const REMINDERS_KEY = 'aavie_reminders';

/** Même repli web que `profile-storage.ts` : pas de Keychain/Keystore dans le navigateur. */
const isWeb = Platform.OS === 'web';

export async function readStoredReminders(userId?: string): Promise<Reminder[]> {
  void userId;
  const raw = isWeb ? window.localStorage.getItem(REMINDERS_KEY) : await SecureStore.getItemAsync(REMINDERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Reminder[];
  } catch {
    return [];
  }
}

export async function writeStoredReminders(userId: string, reminders: Reminder[]): Promise<void> {
  void userId;
  const raw = JSON.stringify(reminders);
  if (isWeb) {
    window.localStorage.setItem(REMINDERS_KEY, raw);
    return;
  }
  await SecureStore.setItemAsync(REMINDERS_KEY, raw);
}
