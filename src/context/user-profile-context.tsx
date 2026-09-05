import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { useLocalData } from '@/hooks/use-local-data';
import { syncStore } from '@/lib/sync-store';

export type UserProfile = {
  civilite?: string;
  prenom?: string;
  nom?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  telephone?: string;
  email?: string;
};
type Value = {
  profile: UserProfile;
  isLoaded: boolean;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  resetProfile: () => Promise<void>;
};
const Context = createContext<Value | null>(null);
export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { userId, rows, isLoaded } = useLocalData('profile');
  const updateProfile = useCallback(
    async (patch: Partial<UserProfile>) => {
      if (userId)
        await syncStore.change(userId, 'profile', userId, (current) => ({
          ...current,
          ...patch,
        }));
    },
    [userId],
  );
  const resetProfile = useCallback(async () => {
    if (userId) await syncStore.change(userId, 'profile', userId, () => null);
  }, [userId]);
  return (
    <Context.Provider
      value={{
        profile: (rows[0]?.payload ?? {}) as UserProfile,
        isLoaded,
        updateProfile,
        resetProfile,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useUserProfile() {
  const value = useContext(Context);
  if (!value) throw new Error('UserProfileProvider absent');
  return value;
}
