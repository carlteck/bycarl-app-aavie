import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, StyleSheet, useColorScheme } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Accueil</TabButton>
          </TabTrigger>
          <TabTrigger name="ressources" href="/ressources" asChild>
            <TabButton>Ressources</TabButton>
          </TabTrigger>
          <TabTrigger name="annuaire" href="/annuaire" asChild>
            <TabButton>Annuaire</TabButton>
          </TabTrigger>
          <TabTrigger name="profil" href="/profil" asChild>
            <TabButton>Profil</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable
      {...props}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}>
        <ThemedText type="label" themeColor={isFocused ? 'primary' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

/**
 * Barre flottante en verre (blur CSS) plutôt qu'un aplat opaque — cohérent avec le bandeau
 * d'en-tête dégradé de chaque écran (voir gradient-header.web.tsx). `backdropFilter` en style
 * inline plutôt que `expo-blur` : ce dernier est une vue native qui ne se rend pas côté serveur
 * (SSR web d'Expo Router), là où un simple `View` + CSS reste toujours sûr.
 */
export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <View {...props} style={styles.tabListContainer}>
      <View
        style={[
          styles.innerContainer,
          {
            backgroundColor: isDark ? 'rgba(21,24,28,0.7)' : 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(20px)',
          },
        ]}>
        <ThemedText type="label" themeColor="primary" style={styles.brandText}>
          AAVIE
        </ThemedText>

        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    borderRadius: Spacing.five,
    flexGrow: 1,
    maxWidth: MaxContentWidth,
    overflow: 'hidden',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  brandText: {
    marginRight: 'auto',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    minHeight: 44,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
