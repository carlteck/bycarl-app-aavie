import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useTabletLayout } from '@/hooks/use-tablet-layout';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const isTablet = useTabletLayout();

  return (
    <NativeTabs
      hidden={isTablet}
      backgroundColor={colors.background}
      indicatorColor={colors.turquoiseTint}
      labelStyle={{ selected: { color: colors.primary } }}
      // Sur Android, le mode par défaut ('auto') masque le libellé des onglets non
      // sélectionnés dès qu'il y en a 4+ — mauvais pour l'accessibilité (CDC : navigation
      // toujours explicite, pas uniquement iconographique).
      labelVisibilityMode="labeled"
    >
      <NativeTabs.Trigger name="accueil">
        <NativeTabs.Trigger.Label>Accueil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="house"
          md="home"
          selectedColor={colors.primary}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="services">
        <NativeTabs.Trigger.Label>Services</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="square.grid.2x2"
          md="apps"
          selectedColor={colors.primary}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="planificateur">
        <NativeTabs.Trigger.Label>Agenda</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="calendar"
          md="calendar_month"
          selectedColor={colors.primary}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="ressources" hidden />
      <NativeTabs.Trigger name="annuaire" hidden />

      <NativeTabs.Trigger name="profil">
        <NativeTabs.Trigger.Label>Compte</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="person.crop.circle"
          md="account_circle"
          selectedColor={colors.primary}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
