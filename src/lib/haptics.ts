import { Platform } from 'react-native';

/** Retour discret : import différé pour qu'un ancien development build reste utilisable. */
export async function selectionHaptic(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const Haptics = await import('expo-haptics');
    await Haptics.selectionAsync();
  } catch (error) {
    void error;
  }
}
