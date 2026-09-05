import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  clearStoredProfile,
  readStoredProfile,
  writeStoredProfile,
} from '@/lib/profile-storage';
import { useAuth } from '@/context/auth-context';

/**
 * Informations civiles utilisées pour pré-remplir les démarches administratives (module
 * Assistant, voir `constants/procedures.ts`). Distinct du profil d'authentification
 * (`auth-context.tsx`). Chaque copie hors-ligne est cloisonnée par compte afin qu'un changement
 * d'utilisateur sur le même téléphone n'expose jamais le profil précédent.
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
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- effacement lors du changement de compte
      setProfile({});
      setIsLoaded(true);
      return;
    }
    setIsLoaded(false);
    (async () => {
      try {
        const stored = await readStoredProfile(user.id);
        setProfile(stored);
      } catch (error) {
        console.warn('Échec de la lecture du profil civil local.', error);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, [user]);

  const updateProfile = useCallback(
    async (patch: Partial<UserProfile>) => {
      if (!user) return;
      setProfile((current) => {
        const next = { ...current, ...patch };
        writeStoredProfile(user.id, next).catch((error) =>
          console.warn(
            'Échec de l’enregistrement du profil civil local.',
            error,
          ),
        );
        return next;
      });
    },
    [user],
  );

  const resetProfile = useCallback(async () => {
    if (!user) return;
    await clearStoredProfile(user.id);
    setProfile({});
  }, [user]);

  const value = useMemo(
    () => ({ profile, isLoaded, updateProfile, resetProfile }),
    [profile, isLoaded, updateProfile, resetProfile],
  );

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context)
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  return context;
}
