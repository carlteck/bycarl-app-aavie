import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const EMAIL_KEY = 'aavie_saved_login_email';
const CREDENTIALS_KEY = 'aavie_saved_login_credentials';
const AVAILABLE_KEY = 'aavie_saved_login_available';

type SavedCredentials = {
  email: string;
  password: string;
};

const protectedOptions: SecureStore.SecureStoreOptions = {
  requireAuthentication: true,
  authenticationPrompt: 'Confirmez votre identité pour vous connecter à AAVIE',
  keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
};

export async function readRememberedEmail(): Promise<string> {
  if (Platform.OS === 'web')
    return globalThis.localStorage?.getItem(EMAIL_KEY) ?? '';
  return (await SecureStore.getItemAsync(EMAIL_KEY)) ?? '';
}

export async function hasBiometricLogin(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  return (await SecureStore.getItemAsync(AVAILABLE_KEY)) === 'true';
}

export async function saveLogin(
  email: string,
  password: string,
  protectWithBiometrics: boolean,
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(EMAIL_KEY, normalizedEmail);
    return;
  }

  await SecureStore.setItemAsync(EMAIL_KEY, normalizedEmail);
  if (!protectWithBiometrics) {
    await clearProtectedCredentials();
    return;
  }

  await SecureStore.setItemAsync(
    CREDENTIALS_KEY,
    JSON.stringify({
      email: normalizedEmail,
      password,
    } satisfies SavedCredentials),
    protectedOptions,
  );
  await SecureStore.setItemAsync(AVAILABLE_KEY, 'true');
}

export async function readBiometricLogin(): Promise<SavedCredentials | null> {
  if (Platform.OS === 'web') return null;
  const raw = await SecureStore.getItemAsync(CREDENTIALS_KEY, protectedOptions);
  if (!raw) {
    await clearProtectedCredentials();
    return null;
  }
  const value: unknown = JSON.parse(raw);
  if (
    typeof value !== 'object' ||
    value === null ||
    !('email' in value) ||
    !('password' in value) ||
    typeof value.email !== 'string' ||
    typeof value.password !== 'string'
  ) {
    await clearProtectedCredentials();
    return null;
  }
  return { email: value.email, password: value.password };
}

export async function clearSavedLogin(): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(EMAIL_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(EMAIL_KEY);
  await clearProtectedCredentials();
}

async function clearProtectedCredentials(): Promise<void> {
  await SecureStore.deleteItemAsync(CREDENTIALS_KEY, protectedOptions).catch(
    () => SecureStore.deleteItemAsync(CREDENTIALS_KEY),
  );
  await SecureStore.deleteItemAsync(AVAILABLE_KEY);
}
