import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Paire de jetons de l'authentification unifiée (voir `site-auth.ts`), distincte du jeton de
 * `session-storage.ts` : celui-là sert à appeler l'API du site elle-même (`Authorization:
 * Bearer`), celle-ci sert à nourrir la session Supabase avec un jeton signé par le site. Les
 * confondre ferait lire le mauvais jeton au mauvais endroit.
 */
export type SiteAuthSession = {
  accessToken: string;
  refreshToken: string;
  /** Instant ISO d'expiration du jeton d'accès, pour décider quand le renouveler. */
  expiresAt: string;
};

const KEY = 'aavie_site_auth_session';
const isWeb = Platform.OS === 'web';

async function getItem(): Promise<string | null> {
  if (isWeb) return window.localStorage.getItem(KEY);
  return SecureStore.getItemAsync(KEY);
}

async function setItem(value: string): Promise<void> {
  if (isWeb) {
    window.localStorage.setItem(KEY, value);
    return;
  }
  await SecureStore.setItemAsync(KEY, value);
}

async function deleteItem(): Promise<void> {
  if (isWeb) {
    window.localStorage.removeItem(KEY);
    return;
  }
  await SecureStore.deleteItemAsync(KEY);
}

function isSiteAuthSession(value: unknown): value is SiteAuthSession {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as SiteAuthSession).accessToken === 'string' &&
    typeof (value as SiteAuthSession).refreshToken === 'string' &&
    typeof (value as SiteAuthSession).expiresAt === 'string'
  );
}

/** `null` si rien n'est stocké, ou si le contenu stocké est illisible — jamais une exception. */
export async function readSiteAuthSession(): Promise<SiteAuthSession | null> {
  try {
    const raw = await getItem();
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isSiteAuthSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function writeSiteAuthSession(
  session: SiteAuthSession,
): Promise<void> {
  await setItem(JSON.stringify(session));
}

export async function clearSiteAuthSession(): Promise<void> {
  await deleteItem();
}
