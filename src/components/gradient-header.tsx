import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';

import { Palette, Spacing } from '@/constants/theme';

type GradientHeaderProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  intro?: string;
  /** Affiche le logotype image (bulle corail) à la place de l'icône de section (écran Accueil uniquement). */
  brand?: boolean;
};

/**
 * Bandeau d'en-tête plein bord : dégradé de marque + cercles qui débordent (motif repris de la
 * couverture de la charte graphique) + panneau vitré (glass) pour le titre — texte toujours sur
 * fond quasi-opaque, jamais directement sur le flou, pour garder un contraste plein.
 */
export function GradientHeader({ icon, title, intro, brand }: GradientHeaderProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <LinearGradient
      colors={[Palette.deepBlue, Palette.deepBluePressed]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.backdrop, { paddingTop: insets.top + Spacing.three }]}>
      <View style={styles.blobAHalo} />
      <View style={styles.blobA} />
      <View style={styles.blobBHalo} />
      <View style={styles.blobB} />

      <ThemedText type="label" style={styles.brandText}>
        AAVIE
      </ThemedText>

      <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={styles.glassOuter}>
        <View
          style={[
            styles.glassInner,
            { backgroundColor: isDark ? 'rgba(21,24,28,0.78)' : 'rgba(255,255,255,0.82)' },
          ]}>
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
            <ThemedText type="sectionTitle" themeColor="text" style={styles.title}>
              {title}
            </ThemedText>
          </View>
          {intro && <ThemedText themeColor="textSecondary">{intro}</ThemedText>}
        </View>
      </BlurView>
    </LinearGradient>
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
  // Cercles décoratifs en deux couches (halo large + faible opacité + coeur plus petit + opacité
  // un peu plus marquée) pour simuler une lueur atmosphérique sans vrai flou natif (pas de CSS
  // `filter` disponible côté natif) — voir la variante web pour un vrai `blur()`.
  blobAHalo: {
    position: 'absolute',
    top: -110,
    right: -95,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Palette.turquoise,
    opacity: 0.12,
  },
  blobA: {
    position: 'absolute',
    top: -70,
    right: -55,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: Palette.turquoise,
    opacity: 0.22,
  },
  blobBHalo: {
    position: 'absolute',
    top: 0,
    left: -110,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: Palette.coral,
    opacity: 0.08,
  },
  blobB: {
    position: 'absolute',
    top: 30,
    left: -70,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Palette.coral,
    opacity: 0.15,
  },
  brandText: {
    color: Palette.white,
    marginBottom: Spacing.two,
    letterSpacing: 1,
  },
  glassOuter: {
    borderRadius: Spacing.four,
    overflow: 'hidden',
  },
  glassInner: {
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
