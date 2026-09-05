import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';

import { Palette, Spacing } from '@/constants/theme';

type GradientHeaderProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  intro?: string;
  brand?: boolean;
};

/**
 * Variante web : `expo-linear-gradient`/`expo-blur` sont des vues natives qui ne se rendent pas
 * côté serveur (le rendu SSR d'Expo Router web ressort vide, "Unable to get the view config...").
 * On reproduit le même look en CSS pur (déjà le pattern du projet, voir `experimental_backgroundImage`
 * historique dans animated-icon.tsx) — sûr pour le SSR, et `backdropFilter` est nativement supporté
 * par react-native-web.
 */
export function GradientHeader({
  icon,
  title,
  intro,
  brand,
}: GradientHeaderProps) {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.backdrop,
        {
          paddingTop: insets.top + Spacing.three,
          experimental_backgroundImage: `linear-gradient(135deg, ${Palette.deepBlue}, ${Palette.deepBluePressed})`,
        },
      ]}
    >
      <View style={styles.blobA} />
      <View style={styles.blobB} />

      <ThemedText type="label" style={styles.brandText}>
        AAVIE
      </ThemedText>

      <View
        style={[
          styles.glassOuter,
          {
            backgroundColor: isDark
              ? 'rgba(21,24,28,0.78)'
              : 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(20px)',
          },
        ]}
      >
        <View style={styles.glassTop}>
          {brand ? (
            // Logotype AAVIE officiel (anneau turquoise + bulle corail souriante) : l'anneau fait
            // déjà partie du PNG source, pas besoin de le simuler avec un fond en dégradé.
            <Image
              source={require('@/assets/images/aavie-logo-mark.png')}
              style={styles.logoMarkBrand}
              contentFit="contain"
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View style={[styles.iconChip, styles.iconChipPlain]}>
              <Ionicons name={icon} size={20} color={Palette.white} />
            </View>
          )}
          <ThemedText
            type="sectionTitle"
            themeColor="text"
            style={styles.title}
          >
            {title}
          </ThemedText>
        </View>
        {intro && <ThemedText themeColor="textSecondary">{intro}</ThemedText>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
    borderBottomLeftRadius: Spacing.five,
    borderBottomRightRadius: Spacing.five,
    overflow: 'hidden',
  },
  // Vrai flou CSS ici (contrairement au natif, `filter` est disponible sans risque en SSR web) :
  // lueur atmosphérique plutôt que ronds nets, cf. les captures de référence.
  blobA: {
    position: 'absolute',
    top: -80,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: Palette.turquoise,
    opacity: 0.5,
    filter: 'blur(40px)',
  },
  blobB: {
    position: 'absolute',
    top: 20,
    left: -80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Palette.coral,
    opacity: 0.35,
    filter: 'blur(36px)',
  },
  brandText: {
    color: Palette.white,
    marginBottom: Spacing.two,
    letterSpacing: 1,
  },
  glassOuter: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  glassTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconChip: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconChipPlain: {
    backgroundColor: Palette.deepBlue,
  },
  logoMarkBrand: {
    width: 38,
    height: 38,
  },
  title: {
    flex: 1,
  },
});
