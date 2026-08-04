import { router, Slot, usePathname } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, View, StyleSheet, useColorScheme } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { MaxContentWidth, Spacing } from '@/constants/theme';

type TabDef = {
  href: string;
  label: string;
  /** Un onglet reste actif tant qu'on est sur une route poussée par-dessus lui (ex: /demarche
   * appartient visuellement à l'onglet Accueil, /profil/informations à l'onglet Profil). */
  match: (pathname: string) => boolean;
};

const TABS: TabDef[] = [
  { href: '/', label: 'Accueil', match: (p) => p === '/' || p.startsWith('/demarche') },
  { href: '/ressources', label: 'Ressources', match: (p) => p.startsWith('/ressources') },
  { href: '/annuaire', label: 'Annuaire', match: (p) => p.startsWith('/annuaire') },
  { href: '/profil', label: 'Profil', match: (p) => p.startsWith('/profil') },
];

/**
 * Barre d'onglets web : `<Slot/>` (pas `expo-router/ui` `<Tabs>`) pour que toute route du fichier
 * (ex: /demarche, /profil/informations) reste navigable — `<Tabs>` n'accepte qu'une liste fermée
 * de `TabTrigger`, donc toute route hors de cette liste était injoignable sur web (clic et
 * `router.push` silencieusement sans effet, cf. session du 2026-08-04). La barre elle-même
 * redevient un simple visuel qui reflète `usePathname()` et pousse via `router.push`.
 */
export default function AppTabs() {
  const pathname = usePathname();

  return (
    <View style={styles.root}>
      <Slot />
      <CustomTabList>
        {TABS.map((tab) => (
          <TabButton key={tab.href} focused={tab.match(pathname)} onPress={() => router.push(tab.href as never)}>
            {tab.label}
          </TabButton>
        ))}
      </CustomTabList>
    </View>
  );
}

function TabButton({
  children,
  focused,
  onPress,
}: {
  children: string;
  focused: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView type={focused ? 'backgroundSelected' : 'backgroundElement'} style={styles.tabButtonView}>
        <ThemedText type="label" themeColor={focused ? 'primary' : 'textSecondary'}>
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
function CustomTabList({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <View style={styles.tabListContainer}>
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

        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
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
