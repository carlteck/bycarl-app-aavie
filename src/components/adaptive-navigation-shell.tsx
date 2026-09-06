import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, usePathname } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SERVICE_GROUPS, type AavieModule } from '@/constants/modules';
import { Palette, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useTabletLayout } from '@/hooks/use-tablet-layout';

type NavItem = Pick<AavieModule, 'title' | 'icon'> & { href: string };

const HOME: NavItem = {
  title: 'Mon espace',
  icon: 'grid-outline',
  href: '/accueil',
};

const ACCOUNT: NavItem = {
  title: 'Mon compte',
  icon: 'person-outline',
  href: '/profil',
};

function hrefFor(module: AavieModule) {
  if (module.id === 'centre-ressources') return '/ressources';
  return module.href;
}

function SidebarItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const active =
    pathname === item.href ||
    (item.href !== '/accueil' && pathname.startsWith(`${item.href}/`));

  return (
    <Pressable
      onPress={() => router.navigate(item.href as never)}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.item,
        active && styles.itemActive,
        pressed && styles.itemPressed,
      ]}
    >
      <View style={[styles.activeBar, !active && styles.activeBarHidden]} />
      <Ionicons
        name={item.icon}
        size={20}
        color={active ? Palette.turquoise : Palette.white}
      />
      <ThemedText type="label" numberOfLines={2} style={styles.itemLabel}>
        {item.title}
      </ThemedText>
    </Pressable>
  );
}

export function AdaptiveNavigationShell({ children }: { children: ReactNode }) {
  const isTablet = useTabletLayout();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user, signOut } = useAuth();

  if (!isTablet || !isAuthenticated) return children;

  return (
    <View style={styles.shell}>
      <ThemedView
        type="primary"
        style={[
          styles.sidebar,
          {
            paddingTop: insets.top + Spacing.three,
            paddingBottom: insets.bottom + Spacing.three,
            paddingLeft: insets.left,
          },
        ]}
      >
        <View style={styles.brand}>
          <Image
            source={require('@/assets/images/aavie-logo-mark.png')}
            contentFit="contain"
            style={styles.logo}
          />
          <ThemedText type="sectionTitle" style={styles.whiteText}>
            AAVIE
          </ThemedText>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.navigation}
        >
          <SidebarItem item={HOME} pathname={pathname} />
          {SERVICE_GROUPS.map((group) => (
            <View key={group.title} style={styles.group}>
              <ThemedText type="caption" style={styles.groupTitle}>
                {group.title.toUpperCase()}
              </ThemedText>
              {group.modules.map((module) => {
                const href = hrefFor(module);
                if (!href) return null;
                return (
                  <SidebarItem
                    key={module.id}
                    item={{ ...module, href }}
                    pathname={pathname}
                  />
                );
              })}
            </View>
          ))}
        </ScrollView>

        <View style={styles.account}>
          <SidebarItem item={ACCOUNT} pathname={pathname} />
          <Pressable
            onPress={signOut}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.item,
              pressed && styles.itemPressed,
            ]}
          >
            <View style={[styles.activeBar, styles.activeBarHidden]} />
            <Ionicons name="log-out-outline" size={20} color={Palette.white} />
            <ThemedText type="label" style={styles.itemLabel}>
              Se déconnecter
            </ThemedText>
          </Pressable>
          <ThemedText type="caption" style={styles.userName} numberOfLines={1}>
            {user ? `${user.first_name} ${user.last_name}` : ''}
          </ThemedText>
        </View>
      </ThemedView>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, flexDirection: 'row' },
  sidebar: { width: 248, paddingRight: Spacing.three },
  content: { flex: 1, minWidth: 0 },
  brand: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.three,
  },
  logo: { width: 36, height: 36 },
  whiteText: { color: Palette.white },
  navigation: { gap: Spacing.two, paddingBottom: Spacing.three },
  group: { gap: Spacing.one },
  groupTitle: {
    color: 'rgba(255,255,255,0.68)',
    fontWeight: '600',
    letterSpacing: 1.2,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  item: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 12,
    paddingRight: Spacing.two,
    overflow: 'hidden',
  },
  itemActive: { backgroundColor: 'rgba(255,255,255,0.14)' },
  itemPressed: { opacity: 0.7 },
  activeBar: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: Palette.turquoise,
  },
  activeBarHidden: { backgroundColor: 'transparent' },
  itemLabel: { flex: 1, color: Palette.white },
  account: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.28)',
    paddingTop: Spacing.two,
  },
  userName: {
    color: 'rgba(255,255,255,0.7)',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.one,
  },
});
