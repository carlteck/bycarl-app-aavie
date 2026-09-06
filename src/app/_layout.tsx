import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AdaptiveNavigationShell } from '@/components/adaptive-navigation-shell';
import { BiometricGate } from '@/components/biometric-gate';
import { UpdateBanner } from '@/components/update-banner';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { SyncProvider } from '@/context/sync-context';
import { RemindersProvider } from '@/context/reminders-context';
import { UserProfileProvider } from '@/context/user-profile-context';

SplashScreen.preventAutoHideAsync();

/**
 * Découpage public / protégé calqué sur le site : `/`, `/a-propos`, `/connexion` et
 * `/inscription` sont libres, tout le reste demande une session — c'est `ProtectedRoute` là-bas,
 * `Stack.Protected` ici (mécanisme officiel d'Expo Router, doc « Authentication »).
 *
 * `guard` est déclaratif : quand `isAuthenticated` bascule, Expo Router redirige de lui-même vers
 * la première route disponible du groupe devenu actif. Aucun `router.replace` manuel — ceux-ci
 * s'exécuteraient dans un effect, donc jamais au rendu serveur web, et laisseraient une page vide.
 */
function RootNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="index" />
        <Stack.Screen name="connexion" />
        <Stack.Screen name="inscription" />
      </Stack.Protected>

      {/* (tabs) porte la barre d'onglets persistante ; demarche, planificateur et notifications
          s'empilent par-dessus. Ces routes doivent rester déclarées au niveau racine, sinon elles
          sont injoignables sur les trois plateformes (cf. session du 2026-08-04). */}
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="demarche" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="credits" />
        <Stack.Screen name="assistant" />
        <Stack.Screen name="aide-redactionnelle" />
        <Stack.Screen name="budget" />
        <Stack.Screen name="coffre-fort" />
        <Stack.Screen name="veille-reglementaire" />
      </Stack.Protected>
      <Stack.Screen name="a-propos" />
      {/* Hors des deux gardes : au retour du lien de confirmation, l'usager n'est pas encore
          connecté, mais la session s'ouvre pendant que l'écran est affiché. Dans le groupe
          public il disparaîtrait à cet instant précis ; dans le groupe protégé il serait
          injoignable à l'arrivée. */}
      <Stack.Screen name="auth/callback" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <SyncProvider>
          <UserProfileProvider>
            <RemindersProvider>
              <AnimatedSplashOverlay />
              <BiometricGate>
                <AdaptiveNavigationShell>
                  <RootNavigator />
                  <UpdateBanner />
                </AdaptiveNavigationShell>
              </BiometricGate>
            </RemindersProvider>
          </UserProfileProvider>
        </SyncProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
