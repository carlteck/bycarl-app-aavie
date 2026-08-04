import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OutlineButton } from './outline-button';
import { PinPad } from './pin-pad';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { useAuth } from '@/context/auth-context';
import { BottomTabInset, Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Step = 'name' | 'choose-pin' | 'confirm-pin';

export function OnboardingScreen() {
  const { createAccount, cancelOnboarding } = useAuth();
  const theme = useTheme();

  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  function handleNameSubmit() {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setError('Merci d’indiquer votre prénom.');
      return;
    }
    setError(null);
    setStep('choose-pin');
  }

  function handleChoosePin(pin: string) {
    setFirstPin(pin);
    setStep('confirm-pin');
  }

  async function handleConfirmPin(pin: string) {
    if (pin !== firstPin) {
      setError('Les deux codes ne correspondent pas. Recommencez.');
      setResetKey((key) => key + 1);
      setStep('choose-pin');
      return;
    }
    setError(null);
    try {
      await createAccount(name.trim(), pin);
    } catch {
      setError('Impossible de créer votre profil sur cet appareil. Réessayez.');
      setResetKey((key) => key + 1);
      setStep('choose-pin');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={[styles.safeArea, { paddingBottom: BottomTabInset + Spacing.three }]}>
        <ThemedView style={styles.header}>
          <ThemedText type="brand" themeColor="primary" style={styles.centerText}>
            AAVIE
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centerText}>
            Créons votre espace personnel, protégé par un code à 4 chiffres.
          </ThemedText>
        </ThemedView>

        {step === 'name' && (
          <ThemedView style={styles.stepContent}>
            <ThemedText type="screenTitle" style={styles.centerText}>
              Comment vous appelez-vous ?
            </ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Votre prénom"
              placeholderTextColor={theme.textSecondary}
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleNameSubmit}
              accessibilityLabel="Votre prénom"
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
            {error && (
              <ThemedText themeColor="textSecondary" style={styles.centerText}>
                {error}
              </ThemedText>
            )}
            <Pressable onPress={handleNameSubmit} accessibilityRole="button" style={styles.primaryButton}>
              {({ pressed }) => (
                <ThemedView type={pressed ? 'primaryPressed' : 'primary'} style={styles.primaryButtonInner}>
                  <ThemedText type="label" style={styles.primaryButtonText}>
                    Continuer
                  </ThemedText>
                </ThemedView>
              )}
            </Pressable>
          </ThemedView>
        )}

        {step === 'choose-pin' && (
          <ThemedView style={styles.stepContent}>
            <ThemedText type="screenTitle" style={styles.centerText}>
              Choisissez un code à 4 chiffres
            </ThemedText>
            {error && (
              <ThemedText themeColor="textSecondary" style={styles.centerText}>
                {error}
              </ThemedText>
            )}
            <PinPad resetKey={resetKey} onComplete={handleChoosePin} />
          </ThemedView>
        )}

        {step === 'confirm-pin' && (
          <ThemedView style={styles.stepContent}>
            <ThemedText type="screenTitle" style={styles.centerText}>
              Confirmez votre code
            </ThemedText>
            <PinPad resetKey={resetKey} onComplete={handleConfirmPin} />
          </ThemedView>
        )}

        <OutlineButton onPress={cancelOnboarding}>Annuler</OutlineButton>
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
    gap: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  centerText: {
    textAlign: 'center',
  },
  stepContent: {
    alignItems: 'center',
    gap: Spacing.four,
  },
  input: {
    width: 260,
    fontSize: 18,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.three,
    textAlign: 'center',
  },
  primaryButton: {
    alignSelf: 'center',
  },
  primaryButtonInner: {
    minHeight: 44,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: Palette.white,
  },
});
