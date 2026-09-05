import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
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

      <NativeTabs.Trigger name="ressources">
        <NativeTabs.Trigger.Label>Ressources</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="books.vertical"
          md="menu_book"
          selectedColor={colors.primary}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="annuaire">
        <NativeTabs.Trigger.Label>Annuaire</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="building.2"
          md="business"
          selectedColor={colors.primary}
        />
      </NativeTabs.Trigger>

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
