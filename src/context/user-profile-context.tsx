import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { clearStoredProfile, readStoredProfile, writeStoredProfile } from '@/lib/profile-storage';

/**
 * Informations civiles utilisées pour pré-remplir les démarches administratives (module
 * Assistant, voir `constants/procedures.ts`). Distinct du profil d'authentification
 * (`auth-context.tsx`) : ces données ne nécessitent ni PIN ni compte pour être saisies, dans le
 * même esprit d'accessibilité que le reste de l'app (aucune donnée obligatoire).
 */
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

type UserProfileContextValue = {
  profile: UserProfile;
  isLoaded: boolean;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  resetProfile: () => Promise<void>;
};

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await readStoredProfile();
        setProfile(stored);
      } catch (error) {
        console.warn('Échec de la lecture du profil civil local.', error);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const updateProfile = useCallback(async (patch: Partial<UserProfile>) => {
    setProfile((current) => {
      const next = { ...current, ...patch };
      writeStoredProfile(next).catch((error) =>
        console.warn('Échec de l’enregistrement du profil civil local.', error)
      );
      return next;
    });
  }, []);

  const resetProfile = useCallback(async () => {
    await clearStoredProfile();
    setProfile({});
  }, []);

  const value = useMemo(
    () => ({ profile, isLoaded, updateProfile, resetProfile }),
    [profile, isLoaded, updateProfile, resetProfile]
  );

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) throw new Error('useUserProfile must be used within a UserProfileProvider');
  return context;
}
