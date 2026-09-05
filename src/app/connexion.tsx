import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OutlineButton } from '@/components/outline-button';
import { PrimaryButton } from '@/components/primary-button';
import { ScreenHeaderBar } from '@/components/screen-header-bar';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { ApiError, NetworkError } from '@/lib/api';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function ConnexionScreen() {
  const { signIn } = useAuth();
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (isSubmitting) return;
    if (email.trim() === '' || password === '') {
      setError('Indiquez votre adresse e-mail et votre mot de passe.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      // `Stack.Protected` bascule seul vers la zone protégée dès que la session s'ouvre :
      // aucune navigation manuelle après la connexion.
      await signIn(email.trim(), password);
    } catch (e) {
      setError(
        e instanceof ApiError || e instanceof NetworkError
          ? e.message
          : 'Connexion impossible. Réessayez dans un instant.',
      );
      setIsSubmitting(false);
    }
  }

  return (
    <ThemedView type="pageBackground" style={styles.screen}>
      <ScreenHeaderBar
        title="Connexion"
        onBack={() => router.back()}
        backLabel="Accueil"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={[styles.flex, { backgroundColor: theme.pageBackground }]}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.contentContainer,
            {
              paddingLeft: Spacing.four + safeAreaInsets.left,
              paddingRight: Spacing.four + safeAreaInsets.right,
              paddingBottom: safeAreaInsets.bottom + Spacing.four,
            },
          ]}
        >
          <View
            style={[
              styles.container,
              {
                backgroundColor: theme.background,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <View style={styles.intro}>
              <ThemedText type="screenTitle">
                Connexion à votre espace
              </ThemedText>
              <ThemedText themeColor="textSecondary">
                Retrouvez vos démarches, vos documents et vos rappels.
              </ThemedText>
            </View>

            <TextField
              label="Adresse e-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="prenom.nom@exemple.fr"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              autoCorrect={false}
              returnKeyType="next"
            />

            <TextField
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secure
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            {error && (
              <ThemedText type="label" themeColor="accent">
                {error}
              </ThemedText>
            )}

            <PrimaryButton onPress={handleSubmit} icon="log-in-outline">
              {isSubmitting ? 'Connexion…' : 'Se connecter'}
            </PrimaryButton>

            <View style={styles.alternative}>
              <ThemedText
                type="caption"
                themeColor="textSecondary"
                style={styles.centerText}
              >
                Pas encore de compte ?
              </ThemedText>
              <OutlineButton
                onPress={() => router.replace('/inscription')}
                icon="person-add-outline"
              >
                Créer mon compte
              </OutlineButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: Spacing.four,
  },
  container: {
    width: '100%',
    maxWidth: Math.min(MaxContentWidth, 480),
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  intro: {
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  alternative: {
    marginTop: Spacing.three,
    gap: Spacing.two,
  },
  centerText: {
    textAlign: 'center',
  },
});
