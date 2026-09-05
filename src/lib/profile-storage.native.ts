import * as SecureStore from 'expo-secure-store';

import {
  clearProfile,
  readProfile,
  writeProfile,
} from '@/lib/offline-database.native';
import type { StoredUserProfile } from '@/lib/profile-storage';

const LEGACY_PROFILE_KEY = 'aavie_user_profile';
let writeQueue = Promise.resolve();

export async function readStoredProfile(userId: string): Promise<StoredUserProfile> {
  const profile = await readProfile(userId);
  if (Object.keys(profile).length > 0) return profile;

  const legacy = await SecureStore.getItemAsync(LEGACY_PROFILE_KEY);
  if (!legacy) return {};
  try {
    const migrated = JSON.parse(legacy) as StoredUserProfile;
    await writeProfile(userId, migrated);
    await SecureStore.deleteItemAsync(LEGACY_PROFILE_KEY);
    return migrated;
  } catch {
    return {};
  }
}

export function writeStoredProfile(userId: string, profile: StoredUserProfile): Promise<void> {
  writeQueue = writeQueue.catch(() => {}).then(() => writeProfile(userId, profile));
  return writeQueue;
}

export function clearStoredProfile(userId: string): Promise<void> {
  writeQueue = writeQueue.catch(() => {}).then(() => clearProfile(userId));
  return writeQueue;
}
