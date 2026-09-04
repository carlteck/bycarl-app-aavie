import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'aavie_session_token';
const BIOMETRIC_ENABLED_KEY = 'aavie_biometric_enabled';

/**
 * `expo-secure-store` n'a pas d'implémentation web (ni Keychain ni Keystore dans un
 * navigateur) : repli sur `localStorage`, moins sûr, comme partout ailleurs dans l'app.
 */
const isWeb = Platform.OS === 'web';

async function getItem(key: string): Promise<string | null> {
  if (isWeb) return window.localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    window.localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    window.localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

/**
 * Jeton de session. Il vit dans le Keychain / Keystore : c'est le secret qui ouvre le compte,
 * il ne doit jamais atterrir dans un stockage en clair sur natif.
 */
export async function readSessionToken(): Promise<string | null> {
  try {
    return await getItem(TOKEN_KEY);
  } catch {
    // Un stockage illisible ne doit pas empêcher d'appeler l'API : on repart sans jeton,
    // l'API répondra 401 et l'utilisateur sera invité à se reconnecter.
    return null;
  }
}

export async function writeSessionToken(token: string): Promise<void> {
  await setItem(TOKEN_KEY, token);
}

export async function clearSessionToken(): Promise<void> {
  await deleteItem(TOKEN_KEY);
}

export async function isBiometricEnabled(): Promise<boolean> {
  return (await getItem(BIOMETRIC_ENABLED_KEY)) === 'true';
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await setItem(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
}
