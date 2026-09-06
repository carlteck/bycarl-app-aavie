import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const sessionStorage = {
  getItem: (key: string) =>
    Platform.OS === 'web'
      ? Promise.resolve(globalThis.localStorage?.getItem(key) ?? null)
      : SecureStore.getItemAsync(key),
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') globalThis.localStorage?.setItem(key, value);
    else await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') globalThis.localStorage?.removeItem(key);
    else await SecureStore.deleteItemAsync(key);
  },
};

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey,
);

/**
 * Cible du lien de confirmation envoyé par Supabase à l'inscription.
 *
 * C'est une URL `https://` et non le schéma `aavie://`, parce que le lien traverse un client de
 * messagerie : beaucoup de webmails refusent d'ouvrir un schéma personnalisé, et le public visé
 * relève massivement ses e-mails sur le web. La page rebondit ensuite vers l'application, et
 * explique quoi faire si elle n'est pas installée.
 *
 * ⚠️ Cette URL doit figurer dans la liste des redirections autorisées du projet Supabase, sinon
 * elle est ignorée SANS erreur : le lien retombe sur l'URL de site et l'usager n'aboutit nulle
 * part, sans que rien ne le signale côté application.
 */
export const AUTH_EMAIL_REDIRECT = 'https://aavieapp.com/app/auth';

export const supabase = createClient(
  supabaseUrl ?? 'https://not-configured.invalid',
  supabasePublishableKey ?? 'not-configured',
  {
    auth: {
      storage: sessionStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      // PKCE plutôt que le flux implicite : le lien de confirmation ne transporte alors qu'un
      // code à usage unique, échangeable seulement par l'appareil qui détient le vérificateur.
      // En implicite, un jeton d'accès complet transiterait dans l'URL — donc dans l'e-mail,
      // dans l'historique du navigateur et dans les journaux de la page de rebond.
      flowType: 'pkce',
    },
  },
);
