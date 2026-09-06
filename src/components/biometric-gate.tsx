import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Keyboard, StyleSheet, View } from 'react-native';
import { useAuth } from '@/context/auth-context';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { PrimaryButton } from './primary-button';
import { OutlineButton } from './outline-button';

export function BiometricGate({ children }: { children: ReactNode }) {
  const { biometricLocked, biometricReady, confirmBiometrics, signOut } =
    useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (biometricLocked) Keyboard.dismiss();
  }, [biometricLocked]);
  const unlock = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      if (!(await confirmBiometrics()))
        setError('Déverrouillage non effectué. Vous pouvez réessayer.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={styles.root}>
      <View
        style={[styles.root, biometricLocked && styles.hidden]}
        pointerEvents={biometricLocked ? 'none' : 'auto'}
        accessibilityElementsHidden={biometricLocked}
        importantForAccessibility={
          biometricLocked ? 'no-hide-descendants' : 'auto'
        }
      >
        {children}
      </View>
      {biometricLocked && (
        <ThemedView style={styles.cover} accessibilityViewIsModal>
          <ThemedText type="screenTitle">AAVIE est verrouillée</ThemedText>
          <ThemedText>
            Confirmez votre identité pour retrouver votre espace.
          </ThemedText>
          {!biometricReady ? (
            <ActivityIndicator />
          ) : (
            <PrimaryButton disabled={busy} onPress={unlock}>
              {busy ? 'Vérification…' : 'Déverrouiller'}
            </PrimaryButton>
          )}
          {!!error && (
            <ThemedText accessibilityRole="alert">{error}</ThemedText>
          )}
          <OutlineButton
            onPress={() => {
              if (!busy)
                void signOut().catch(() =>
                  setError('Déconnexion impossible. Réessayez.'),
                );
            }}
          >
            Se déconnecter
          </OutlineButton>
        </ThemedView>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  hidden: { opacity: 0 },
  cover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: 28,
    gap: 20,
  },
});
