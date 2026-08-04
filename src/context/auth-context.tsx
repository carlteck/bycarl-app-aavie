import * as LocalAuthentication from 'expo-local-authentication';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  clearLocalAccount,
  createLocalAccount,
  getDisplayName,
  hasLocalAccount,
  isBiometricEnabled,
  setBiometricEnabled as persistBiometricEnabled,
  verifyPin,
} from '@/lib/auth-storage';

/**
 * Le CDC demande une authentification pour protéger les données personnelles (§6-7), pas un
 * péage à l'entrée de l'app : la création de profil/PIN est donc optionnelle, ET l'app ne
 * verrouille JAMAIS au lancement, qu'un profil existe ou non — `unlocked` est systématiquement
 * l'état de démarrage. Le verrouillage (`locked`) n'est atteignable que par une action explicite
 * en session (bouton "Verrouiller" dans Profil) ; il ne persiste pas d'un lancement à l'autre.
 *
 * Pas d'état `loading` bloquant : un statut initial qui dépendrait d'un `useEffect` pour se
 * résoudre ne se résoudrait jamais pendant le rendu serveur web (les effects ne s'exécutent pas
 * en SSR), ce qui exporterait des pages statiques vides. `unlocked` est donc l'état initial
 * synchrone ; `hasAccount`/`displayName`/biométrie se peuplent ensuite de façon asynchrone sans
 * bloquer le premier rendu.
 */
type AuthStatus = 'onboarding' | 'locked' | 'unlocked';

type AuthContextValue = {
  status: AuthStatus;
  hasAccount: boolean;
  displayName: string | null;
  biometricEnabled: boolean;
  biometricAvailable: boolean;
  /** Lance la création d'un profil sécurisé (optionnel, depuis l'onglet Profil). */
  startOnboarding: () => void;
  /** Abandonne la création de profil en cours, retour à l'accès libre. */
  cancelOnboarding: () => void;
  createAccount: (displayName: string, pin: string) => Promise<void>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  unlockWithBiometrics: () => Promise<boolean>;
  toggleBiometrics: (enabled: boolean) => Promise<void>;
  lock: () => void;
  resetLocalData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('unlocked');
  const [hasAccount, setHasAccount] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [accountExists, name, biometricOn, hasHardware, isEnrolled] = await Promise.all([
          hasLocalAccount(),
          getDisplayName(),
          isBiometricEnabled(),
          LocalAuthentication.hasHardwareAsync(),
          LocalAuthentication.isEnrolledAsync(),
        ]);

        setHasAccount(accountExists);
        setDisplayName(name);
        setBiometricEnabledState(biometricOn);
        setBiometricAvailable(hasHardware && isEnrolled);
      } catch (error) {
        // Un profil illisible (stockage corrompu, permission refusée...) ne doit jamais
        // bloquer l'accès à l'app : on retombe sur l'état "aucun profil" et l'utilisateur
        // peut continuer normalement, quitte à recréer un profil plus tard si besoin.
        console.warn('Échec de la lecture du profil local, poursuite en accès libre.', error);
        setHasAccount(false);
      }
    })();
  }, []);

  const startOnboarding = useCallback(() => setStatus('onboarding'), []);
  const cancelOnboarding = useCallback(() => setStatus('unlocked'), []);

  const createAccount = useCallback(async (name: string, pin: string) => {
    await createLocalAccount(name, pin);
    setDisplayName(name);
    setHasAccount(true);
    setStatus('unlocked');
  }, []);

  const unlockWithPin = useCallback(async (pin: string) => {
    const valid = await verifyPin(pin);
    if (valid) setStatus('unlocked');
    return valid;
  }, []);

  const unlockWithBiometrics = useCallback(async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Déverrouiller AAVIE',
      cancelLabel: 'Annuler',
    });
    if (result.success) setStatus('unlocked');
    return result.success;
  }, []);

  const toggleBiometrics = useCallback(async (enabled: boolean) => {
    await persistBiometricEnabled(enabled);
    setBiometricEnabledState(enabled);
  }, []);

  const lock = useCallback(() => setStatus('locked'), []);

  const resetLocalData = useCallback(async () => {
    await clearLocalAccount();
    setDisplayName(null);
    setBiometricEnabledState(false);
    setHasAccount(false);
    setStatus('unlocked');
  }, []);

  const value = useMemo(
    () => ({
      status,
      hasAccount,
      displayName,
      biometricEnabled,
      biometricAvailable,
      startOnboarding,
      cancelOnboarding,
      createAccount,
      unlockWithPin,
      unlockWithBiometrics,
      toggleBiometrics,
      lock,
      resetLocalData,
    }),
    [
      status,
      hasAccount,
      displayName,
      biometricEnabled,
      biometricAvailable,
      startOnboarding,
      cancelOnboarding,
      createAccount,
      unlockWithPin,
      unlockWithBiometrics,
      toggleBiometrics,
      lock,
      resetLocalData,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
