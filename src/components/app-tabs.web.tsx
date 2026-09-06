import { router, Slot, usePathname } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { useTheme } from '@/hooks/use-theme';
import { useTabletLayout } from '@/hooks/use-tablet-layout';

import { MaxContentWidth, Spacing } from '@/constants/theme';

type TabDef = {
  href: string;
  label: string;
  /** Un onglet reste actif tant qu'on est sur une route poussée par-dessus lui (ex: /demarche
   * appartient visuellement à l'onglet Accueil, /profil/informations à l'onglet Profil). */
  match: (pathname: string) => boolean;
};

const TABS: TabDef[] = [
  {
    href: '/accueil',
    label: 'Accueil',
    match: (p) => p === '/accueil' || p.startsWith('/demarche'),
  },
  {
    href: '/services',
    label: 'Services',
    match: (p) => p.startsWith('/services'),
  },
  {
    href: '/planificateur',
    label: 'Agenda',
    match: (p) => p.startsWith('/planificateur'),
  },
  { href: '/profil', label: 'Compte', match: (p) => p.startsWith('/profil') },
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
  const isTablet = useTabletLayout();

  return (
    <View style={styles.root}>
      <Slot />
      {!isTablet && (
        <CustomTabList>
          {TABS.map((tab) => (
            <TabButton
              key={tab.href}
              focused={tab.match(pathname)}
              onPress={() => router.push(tab.href as never)}
            >
              {tab.label}
            </TabButton>
          ))}
        </CustomTabList>
      )}
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
      style={({ pressed }) => pressed && styles.pressed}
    >
      <ThemedView
        type={focused ? 'turquoiseTint' : 'background'}
        style={styles.tabButtonView}
      >
        <ThemedText
          type="label"
          themeColor={focused ? 'primary' : 'textSecondary'}
        >
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

function CustomTabList({ children }: { children: ReactNode }) {
  const theme = useTheme();

  return (
    <View style={styles.tabListContainer}>
      <View
        style={[
          styles.innerContainer,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.cardBorder,
          },
        ]}
      >
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
    bottom: 0,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    borderTopWidth: 1,
    flexGrow: 1,
    maxWidth: MaxContentWidth,
    overflow: 'hidden',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    minHeight: 44,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
