import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OutlineButton } from '@/components/outline-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

/**
 * Retour du lien de confirmation d'e-mail.
 *
 * Supabase renvoie vers `https://aavieapp.com/app/auth`, qui rebondit ici en `aavie://auth/callback`
 * avec un code à usage unique. Ce code s'échange contre une session, mais uniquement sur
 * l'appareil qui détient le vérificateur PKCE — donc celui qui a servi à l'inscription.
 *
 * Cette route vit HORS des deux `Stack.Protected` du layout racine : au moment où l'usager arrive
 * ici, il n'est précisément pas encore connecté. La placer dans le groupe authentifié la rendrait
 * injoignable, et dans le groupe public elle disparaîtrait au moment même où la session s'ouvre.
 */
export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{
    code?: string;
    error?: string;
    error_description?: string;
  }>();
  const insets = useSafeAreaInsets();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function completeSignIn() {
      if (!isSupabaseConfigured) {
        setError(
          'La connexion n’est pas encore configurée dans cette application.',
        );
        return;
      }

      // Supabase renvoie son propre message quand le lien a expiré ou a déjà servi. On le
      // remplace : « otp_expired » n'apprend rien à qui vient de cliquer sur un lien.
      if (params.error) {
        setError(
          'Ce lien de confirmation a expiré ou a déjà été utilisé. Demandez-en un nouveau depuis l’écran de connexion.',
        );
        return;
      }

      if (!params.code) {
        setError(
          'Ce lien de confirmation est incomplet. Rouvrez-le depuis votre e-mail.',
        );
        return;
      }

      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(params.code);
      if (cancelled) return;

      if (exchangeError) {
        // Cas le plus fréquent : l'e-mail a été ouvert sur un autre appareil que celui de
        // l'inscription. Le vérificateur PKCE n'y est pas, l'échange ne peut pas aboutir.
        setError(
          'La confirmation n’a pas pu aboutir sur cet appareil. Ouvrez le lien sur le téléphone où vous avez créé votre compte, ou connectez-vous directement.',
        );
        return;
      }

      // La session est ouverte : `onAuthStateChange` bascule `isAuthenticated`, mais cette route
      // vit hors des groupes gardés et ne se refermerait pas d'elle-même.
      router.replace('/accueil');
    }

    void completeSignIn();

    return () => {
      cancelled = true;
    };
  }, [params.code, params.error]);

  return (
    <ThemedView
      style={[styles.screen, { paddingTop: insets.top + Spacing.five }]}
    >
      <View style={styles.content}>
        {error ? (
          <>
            <ThemedText type="screenTitle" style={styles.title}>
              Confirmation impossible
            </ThemedText>
            <ThemedText style={styles.body}>{error}</ThemedText>
            <OutlineButton onPress={() => router.replace('/connexion')}>
              Aller à la connexion
            </OutlineButton>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" />
            <ThemedText style={styles.body}>
              Confirmation de votre adresse e-mail…
            </ThemedText>
          </>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: Spacing.four },
  content: {
    flex: 1,
    gap: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  title: { textAlign: 'center' },
  body: { textAlign: 'center' },
});
