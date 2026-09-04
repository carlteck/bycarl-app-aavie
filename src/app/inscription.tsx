import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconChip } from '@/components/icon-chip';
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

/**
 * Inscription — équivalent de `/inscription` sur le site, même endpoint `register.php`. Le rôle
 * y est écrit en dur à `'client'` côté serveur : il n'est jamais lu depuis la requête, sans quoi
 * n'importe qui pourrait se créer un compte administrateur.
 *
 * La longueur minimale du mot de passe est vérifiée par le serveur (`Auth::passwordMinLength()`,
 * réglable dans l'administration). On ne la duplique pas ici : elle divergerait au premier
 * changement de réglage.
 */
export default function InscriptionScreen() {
  const { register } = useAuth();
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (isSubmitting) return;
    if (firstName.trim() === '' || lastName.trim() === '' || email.trim() === '' || password === '') {
      setError('Tous les champs sont requis.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });
    } catch (e) {
      setError(
        e instanceof ApiError || e instanceof NetworkError
          ? e.message
          : 'Création impossible. Réessayez dans un instant.'
      );
      setIsSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <ScreenHeaderBar title="Créer mon compte" onBack={() => router.back()} backLabel="Accueil" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={[styles.flex, { backgroundColor: theme.background }]}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.contentContainer,
            {
              paddingLeft: Spacing.four + safeAreaInsets.left,
              paddingRight: Spacing.four + safeAreaInsets.right,
              paddingBottom: safeAreaInsets.bottom + Spacing.four,
            },
          ]}>
          <View style={styles.container}>
            <View style={styles.intro}>
              <ThemedText type="screenTitle">Créer votre compte</ThemedText>
              <ThemedText themeColor="textSecondary">
                Votre compte fonctionne sur l’application et sur le site aavie, avec les mêmes
                identifiants.
              </ThemedText>
            </View>

            <TextField
              label="Prénom"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Votre prénom"
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
              returnKeyType="next"
            />

            <TextField
              label="Nom"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Votre nom"
              autoCapitalize="words"
              autoComplete="family-name"
              textContentType="familyName"
              returnKeyType="next"
            />

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
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            {error && (
              <ThemedText type="label" themeColor="accent">
                {error}
              </ThemedText>
            )}

            <PrimaryButton onPress={handleSubmit} icon="person-add-outline">
              {isSubmitting ? 'Création…' : 'Créer mon compte'}
            </PrimaryButton>

            <View style={[styles.notice, { backgroundColor: theme.turquoiseTint }]}>
              <IconChip name="gift-outline" variant="primary" />
              <View style={styles.noticeText}>
                <ThemedText type="label" themeColor="turquoiseTintText">
                  Des crédits offerts chaque mois
                </ThemedText>
                <ThemedText type="caption" themeColor="turquoiseTintText">
                  Vos crédits servent à l’assistant et à l’aide rédactionnelle. L’annuaire, les
                  ressources, la veille, le planificateur et le budget restent gratuits.
                </ThemedText>
              </View>
            </View>

            <View style={styles.alternative}>
              <ThemedText type="caption" themeColor="textSecondary" style={styles.centerText}>
                Vous avez déjà un compte ?
              </ThemedText>
              <OutlineButton onPress={() => router.replace('/connexion')} icon="log-in-outline">
                Se connecter
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
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  intro: {
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.four,
    marginTop: Spacing.two,
  },
  noticeText: {
    flex: 1,
    gap: Spacing.half,
  },
  alternative: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  centerText: {
    textAlign: 'center',
  },
});
