import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientHeader } from './gradient-header';
import { ModuleCard } from './module-card';
import { ThemedView } from './themed-view';

import type { AavieModule, AavieSection } from '@/constants/modules';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SectionScreenProps = {
  section: AavieSection;
  /** Affiche le logotype de l'application dans le bandeau (écran Accueil uniquement). */
  showAppTitle?: boolean;
  /** Contenu additionnel inséré entre l'en-tête et la liste des modules (ex: panneau de compte). */
  beforeModules?: ReactNode;
};

/** Regroupe les modules par paires pour la grille bento (1 carte vedette + rangées de 2). */
function pairUp(modules: AavieModule[]) {
  const pairs: AavieModule[][] = [];
  for (let i = 0; i < modules.length; i += 2) {
    pairs.push(modules.slice(i, i + 2));
  }
  return pairs;
}

export function SectionScreen({ section, showAppTitle, beforeModules }: SectionScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

  const [featureModule, ...restModules] = section.modules;
  const compactPairs = pairUp(restModules);

  const contentPlatformStyle = Platform.select({
    android: {
      paddingLeft: safeAreaInsets.left,
      paddingRight: safeAreaInsets.right,
      paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
    },
    web: {
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ThemedView style={styles.screen}>
      <GradientHeader icon={section.icon} title={section.heading} intro={section.intro} brand={showAppTitle} />
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentInset={{ bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three }}
        contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
        <ThemedView style={styles.container}>
          {beforeModules}

          <ThemedView
            style={[
              styles.list,
              { paddingLeft: Spacing.four + safeAreaInsets.left, paddingRight: Spacing.four + safeAreaInsets.right },
            ]}>
            {featureModule && <ModuleCard {...featureModule} variant="feature" />}
            {compactPairs.map((pair) => (
              <View key={pair.map((m) => m.id).join('-')} style={styles.bentoRow}>
                {pair.map((module) => (
                  <ModuleCard key={module.id} {...module} variant="compact" />
                ))}
              </View>
            ))}
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flexGrow: 1,
  },
  list: {
    gap: Spacing.three,
    paddingTop: Spacing.four,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
});
