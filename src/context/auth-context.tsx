import * as LocalAuthentication from 'expo-local-authentication';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { ApiError, apiFetch } from '@/lib/api';
import {
  clearSessionToken,
  isBiometricEnabled,
  setBiometricEnabled as persistBiometricEnabled,
  writeSessionToken,
} from '@/lib/session-storage';

/**
 * Compte AAVIE, adossé à la même API PHP que le site : l'application n'a plus de compte local.
 * Un compte créé ici fonctionne sur le site et inversement, et le solde de crédits est le même
 * des deux côtés.
 *
 * Ce contexte ne décide pas quel écran afficher : `Stack.Protected` s'en charge dans
 * [src/app/_layout.tsx](../app/_layout.tsx) selon `isAuthenticated`. Ici on ne garde que la
 * session et le profil.
 *
 * `isAuthenticated` démarre à `false` de façon synchrone, jamais dans un état d'attente : un
 * statut qui ne se résoudrait que dans un `useEffect` ne se résoudrait jamais au rendu serveur
 * web (les effects n'y sont pas exécutés) et exporterait des pages vides. La zone publique est
 * le repli sûr, et c'est le bon contenu statique.
 */
export interface AavieUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'client' | 'admin';
  plan_id: string | null;
  plan_name: string | null;
  credit_balance: number;
  monthly_credits: number;
  rollover_months: number;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

type AuthContextValue = {
  user: AavieUser | null;
  isAuthenticated: boolean;
  /** La session a fini d'être vérifiée auprès du serveur. Ne bloque aucun rendu. */
  sessionChecked: boolean;
  biometricEnabled: boolean;
  biometricAvailable: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  /** Relit le profil : le solde de crédits change à chaque action facturée. */
  refreshUser: () => Promise<void>;
  toggleBiometrics: (enabled: boolean) => Promise<void>;
  confirmBiometrics: () => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AavieUser | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const loadSession = useCallback(async () => {
    try {
      const data = await apiFetch<{ user: AavieUser | null }>('/me.php');
      setUser(data.user);
    } catch {
      // Serveur injoignable ou session expirée : on reste sur la zone publique plutôt que
      // d'afficher une application vide. L'utilisateur pourra se reconnecter.
      setUser(null);
    } finally {
      setSessionChecked(true);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    (async () => {
      try {
        const [enabled, hasHardware, isEnrolled] = await Promise.all([
          isBiometricEnabled(),
          LocalAuthentication.hasHardwareAsync(),
          LocalAuthentication.isEnrolledAsync(),
        ]);
        setBiometricEnabledState(enabled);
        setBiometricAvailable(hasHardware && isEnrolled);
      } catch (error) {
        console.warn('Échec de la lecture des réglages biométriques.', error);
      }
    })();
  }, []);

  /**
   * L'API retourne aujourd'hui une session par cookie ; elle retournera un jeton porteur quand
   * il sera ajouté côté serveur. On stocke celui-ci dès qu'il est présent : le code d'appel n'a
   * rien à changer le jour de la bascule.
   */
  const persistToken = useCallback(async (payload: { token?: string }) => {
    if (payload.token) await writeSessionToken(payload.token);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const data = await apiFetch<{ user: AavieUser; token?: string }>('/login.php', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await persistToken(data);
      // `login.php` ne renvoie pas le solde ni le forfait : on relit le profil complet.
      await loadSession();
    },
    [loadSession, persistToken]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const data = await apiFetch<{ user: AavieUser; token?: string }>('/register.php', {
        method: 'POST',
        body: JSON.stringify({
          first_name: input.firstName,
          last_name: input.lastName,
          email: input.email,
          password: input.password,
        }),
      });
      await persistToken(data);
      await loadSession();
    },
    [loadSession, persistToken]
  );

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiFetch<{ user: AavieUser | null }>('/me.php');
      setUser(data.user);
    } catch (error) {
      // Un rafraîchissement raté ne doit pas déconnecter : le solde affiché sera périmé, mais
      // la limite réelle est appliquée par le serveur à chaque requête.
      if (error instanceof ApiError && error.status === 401) setUser(null);
    }
  }, []);

  const toggleBiometrics = useCallback(async (enabled: boolean) => {
    await persistBiometricEnabled(enabled);
    setBiometricEnabledState(enabled);
  }, []);

  const confirmBiometrics = useCallback(async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirmer votre identité',
      cancelLabel: 'Annuler',
    });
    return result.success;
  }, []);

  const signOut = useCallback(async () => {
    // Le jeton local part d'abord : même si le serveur est injoignable, la déconnexion doit
    // aboutir côté appareil, sinon l'utilisateur reste connecté malgré son action.
    await clearSessionToken();
    setUser(null);
    await apiFetch('/logout.php', { method: 'POST' }).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      sessionChecked,
      biometricEnabled,
      biometricAvailable,
      signIn,
      register,
      refreshUser,
      toggleBiometrics,
      confirmBiometrics,
      signOut,
    }),
    [
      user,
      sessionChecked,
      biometricEnabled,
      biometricAvailable,
      signIn,
      register,
      refreshUser,
      toggleBiometrics,
      confirmBiometrics,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
