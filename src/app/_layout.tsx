import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { LockScreen } from '@/components/lock-screen';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { RemindersProvider } from '@/context/reminders-context';
import { UserProfileProvider } from '@/context/user-profile-context';

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { status } = useAuth();

  // 'onboarding' s'affiche en plein écran même si un profil peut être créé
  // depuis l'onglet Profil : c'est un flux ponctuel, pas un mode de navigation.
  if (status === 'onboarding') return <OnboardingScreen />;
  if (status === 'locked') return <LockScreen />;
  // Stack racine : (tabs) porte la barre d'onglets persistante, demarche s'empile par-dessus.
  // Nécessaire pour que /demarche (route hors-onglets) reste navigable sur les 3 plateformes —
  // AppTabs seul (NativeTabs natif ou Tabs web) ne connaît que ses 4 routes déclarées, toute
  // route en dehors (ex: /demarche) était injoignable en clic comme en navigation directe par URL
  // (cf. session du 2026-08-04).
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="demarche" />
      <Stack.Screen name="planificateur" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <UserProfileProvider>
          <RemindersProvider>
            <AnimatedSplashOverlay />
            <AuthGate />
          </RemindersProvider>
        </UserProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
