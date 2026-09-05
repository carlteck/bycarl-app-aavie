import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const PROFILE_KEY = 'aavie_user_profile';

/** Même repli web que `auth-storage.ts` : pas de Keychain/Keystore dans le navigateur. */
const isWeb = Platform.OS === 'web';

export type StoredUserProfile = Record<string, string>;

export async function readStoredProfile(
  userId?: string,
): Promise<StoredUserProfile> {
  void userId;
  const raw = isWeb
    ? window.localStorage.getItem(PROFILE_KEY)
    : await SecureStore.getItemAsync(PROFILE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as StoredUserProfile;
  } catch {
    return {};
  }
}

export async function writeStoredProfile(
  userId: string,
  profile: StoredUserProfile,
): Promise<void> {
  void userId;
  const raw = JSON.stringify(profile);
  if (isWeb) {
    window.localStorage.setItem(PROFILE_KEY, raw);
    return;
  }
  await SecureStore.setItemAsync(PROFILE_KEY, raw);
}

export async function clearStoredProfile(userId?: string): Promise<void> {
  void userId;
  if (isWeb) {
    window.localStorage.removeItem(PROFILE_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(PROFILE_KEY);
}
