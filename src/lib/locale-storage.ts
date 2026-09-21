import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'aavie_locale';

export async function readStoredLocale(): Promise<string | null> {
  if (Platform.OS === 'web')
    return globalThis.localStorage?.getItem(KEY) ?? null;
  return SecureStore.getItemAsync(KEY);
}

export async function writeStoredLocale(code: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(KEY, code);
    return;
  }
  await SecureStore.setItemAsync(KEY, code);
}
