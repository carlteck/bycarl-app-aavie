import { syncStore } from './sync-store';

export type StoredUserProfile = Record<string, string>;
export async function readStoredProfile(
  userId: string,
): Promise<StoredUserProfile> {
  return ((await syncStore.read(userId, 'profile'))[0]?.payload ??
    {}) as StoredUserProfile;
}
export function writeStoredProfile(
  userId: string,
  profile: StoredUserProfile,
): Promise<void> {
  return syncStore.change(userId, 'profile', userId, () => profile);
}
export function clearStoredProfile(userId: string): Promise<void> {
  return syncStore.change(userId, 'profile', userId, () => null);
}
