import * as LocalAuthentication from 'expo-local-authentication';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { User } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import { ApiError } from '@/lib/api';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import {
  isBiometricEnabled,
  setBiometricEnabled as persistBiometricEnabled,
} from '@/lib/session-storage';

export type AccountType = 'individual' | 'company';

/** Dossier d'entreprise, saisi à l'inscription d'un compte `company`. */
export interface CompanyInput {
  legalName: string;
  legalForm: string;
  siret: string;
  vatNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
  contactRole?: string;
}

export interface AavieUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'client' | 'admin';
  account_type: AccountType;
  locale: string;
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
  accountType: AccountType;
  locale: string;
  /** Fourni uniquement pour un compte entreprise ; ignoré côté serveur sinon. */
  company?: CompanyInput;
}

type AuthContextValue = {
  user: AavieUser | null;
  isAuthenticated: boolean;
  /** La session a fini d'être vérifiée auprès du serveur. Ne bloque aucun rendu. */
  sessionChecked: boolean;
  biometricEnabled: boolean;
  biometricAvailable: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (
    input: RegisterInput,
  ) => Promise<{ confirmationRequired: boolean }>;
  /** Relit les informations du compte Supabase. */
  refreshUser: () => Promise<void>;
  toggleBiometrics: (enabled: boolean) => Promise<void>;
  confirmBiometrics: () => Promise<boolean>;
  signOut: () => Promise<void>;
};

function toAppUser(user: User): AavieUser {
  const profile = user.user_metadata;
  return {
    id: user.id,
    email: user.email ?? '',
    first_name:
      typeof profile.first_name === 'string' ? profile.first_name : '',
    last_name: typeof profile.last_name === 'string' ? profile.last_name : '',
    role: user.app_metadata.role === 'admin' ? 'admin' : 'client',
    account_type: profile.account_type === 'company' ? 'company' : 'individual',
    locale: typeof profile.locale === 'string' ? profile.locale : 'fr',
    plan_id: null,
    plan_name: null,
    credit_balance: 0,
    monthly_credits: 0,
    rollover_months: 0,
  };
}

function authError(error: { code?: string; message: string; status?: number }) {
  const messages: Record<string, string> = {
    invalid_credentials: 'Adresse e-mail ou mot de passe incorrect.',
    email_not_confirmed:
      'Confirmez votre adresse e-mail avec le lien reçu avant de vous connecter.',
    user_already_exists: 'Un compte existe déjà avec cette adresse e-mail.',
    weak_password: 'Choisissez un mot de passe plus robuste.',
    over_request_rate_limit:
      'Trop de tentatives. Réessayez dans quelques instants.',
    over_email_send_rate_limit:
      'Veuillez patienter avant de demander un nouvel e-mail.',
  };
  return new ApiError(
    messages[error.code ?? ''] ??
      'Connexion au service impossible. Réessayez dans un instant.',
    error.status ?? 400,
  );
}

function requireSupabase() {
  if (!isSupabaseConfigured)
    throw new ApiError(
      'La connexion n’est pas encore configurée dans cette application.',
      503,
    );
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AavieUser | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- configuration absente, aucune session à restaurer
      setSessionChecked(true);
      return;
    }
    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ? toAppUser(session.user) : null);
      setSessionChecked(true);
    });
    const refresh = (state: string) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    };
    const appState =
      Platform.OS !== 'web'
        ? AppState.addEventListener('change', refresh)
        : null;
    if (Platform.OS !== 'web') refresh(AppState.currentState);
    return () => {
      active = false;
      subscription.unsubscribe();
      appState?.remove();
      if (Platform.OS !== 'web') supabase.auth.stopAutoRefresh();
    };
  }, []);

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

  const signIn = useCallback(async (email: string, password: string) => {
    requireSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw authError(error);
    setUser(toAppUser(data.user));
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    requireSupabase();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          first_name: input.firstName,
          last_name: input.lastName,
          account_type: input.accountType,
          locale: input.locale,
          ...(input.accountType === 'company'
            ? { company: input.company }
            : {}),
        },
      },
    });
    if (error) throw authError(error);
    if (data.session && data.user) setUser(toAppUser(data.user));
    return { confirmationRequired: !data.session };
  }, []);

  const refreshUser = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user) setUser(toAppUser(data.user));
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
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) throw authError(error);
    setUser(null);
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
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
