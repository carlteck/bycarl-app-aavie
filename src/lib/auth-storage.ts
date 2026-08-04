import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const DISPLAY_NAME_KEY = 'aavie_display_name';
const PIN_SALT_KEY = 'aavie_pin_salt';
const PIN_HASH_KEY = 'aavie_pin_hash';
const BIOMETRIC_ENABLED_KEY = 'aavie_biometric_enabled';

/**
 * expo-secure-store has no web implementation (Keychain/Keystore don't exist in browsers).
 * On web we fall back to localStorage — acceptable for this local-only prototype, but it
 * means account data is not encrypted at rest on web the way it is on iOS/Android.
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

async function hashPin(pin: string, salt: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);
}

export async function getDisplayName() {
  return getItem(DISPLAY_NAME_KEY);
}

export async function hasLocalAccount() {
  return (await getItem(PIN_HASH_KEY)) !== null;
}

export async function createLocalAccount(displayName: string, pin: string) {
  const salt = Crypto.randomUUID();
  const hash = await hashPin(pin, salt);
  await setItem(DISPLAY_NAME_KEY, displayName);
  await setItem(PIN_SALT_KEY, salt);
  await setItem(PIN_HASH_KEY, hash);
}

export async function verifyPin(pin: string) {
  const salt = await getItem(PIN_SALT_KEY);
  const storedHash = await getItem(PIN_HASH_KEY);
  if (!salt || !storedHash) return false;
  const hash = await hashPin(pin, salt);
  return hash === storedHash;
}

export async function isBiometricEnabled() {
  return (await getItem(BIOMETRIC_ENABLED_KEY)) === 'true';
}

export async function setBiometricEnabled(enabled: boolean) {
  await setItem(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
}

export async function clearLocalAccount() {
  await Promise.all([
    deleteItem(DISPLAY_NAME_KEY),
    deleteItem(PIN_SALT_KEY),
    deleteItem(PIN_HASH_KEY),
    deleteItem(BIOMETRIC_ENABLED_KEY),
  ]);
}
