import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OutlineButton } from './outline-button';
import { PinPad } from './pin-pad';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { useAuth } from '@/context/auth-context';
import { confirmResetLocalData } from '@/lib/confirm-reset';
import { BottomTabInset, Spacing } from '@/constants/theme';

export function LockScreen() {
  const {
    displayName,
    biometricAvailable,
    biometricEnabled,
    unlockWithPin,
    unlockWithBiometrics,
    resetLocalData,
  } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const canUseBiometrics = biometricAvailable && biometricEnabled;

  useEffect(() => {
    if (canUseBiometrics) {
      unlockWithBiometrics();
    }
    // Only trigger once when the lock screen appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePinComplete(pin: string) {
    const valid = await unlockWithPin(pin);
    if (!valid) {
      setError('Code incorrect. Réessayez.');
      setResetKey((key) => key + 1);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={[styles.safeArea, { paddingBottom: BottomTabInset + Spacing.three }]}>
        <ThemedView style={styles.header}>
          <ThemedText type="brand" themeColor="primary" style={styles.centerText}>
            AAVIE
          </ThemedText>
          <ThemedText type="screenTitle" style={styles.centerText}>
            {displayName ? `Bonjour ${displayName}` : 'Bon retour'}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centerText}>
            Saisissez votre code pour continuer.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.content}>
          {error && (
            <ThemedText themeColor="textSecondary" style={styles.centerText}>
              {error}
            </ThemedText>
          )}
          <PinPad resetKey={resetKey} onComplete={handlePinComplete} />
        </ThemedView>

        {canUseBiometrics && (
          <OutlineButton onPress={unlockWithBiometrics}>Utiliser Face ID / Touch ID</OutlineButton>
        )}

        <Pressable
          onPress={() => confirmResetLocalData(resetLocalData)}
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => pressed && styles.pressed}>
          <ThemedText type="label" themeColor="textSecondary">
            Code oublié ? Réinitialiser mes données locales
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  centerText: {
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
    gap: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
});
