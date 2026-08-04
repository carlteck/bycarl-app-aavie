import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { LockScreen } from '@/components/lock-screen';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { UserProfileProvider } from '@/context/user-profile-context';

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { status } = useAuth();

  // 'onboarding' s'affiche en plein écran même si un profil peut être créé
  // depuis l'onglet Profil : c'est un flux ponctuel, pas un mode de navigation.
  if (status === 'onboarding') return <OnboardingScreen />;
  if (status === 'locked') return <LockScreen />;
  return <AppTabs />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <UserProfileProvider>
          <AnimatedSplashOverlay />
          <AuthGate />
        </UserProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
