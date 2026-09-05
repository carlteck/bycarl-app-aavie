/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

/**
 * Charte graphique mobile officielle AAVIE (voir docs/charte-graphique-aavie-mobile.pdf, v1.0
 * Août 2026), organisée par rôle fonctionnel :
 *
 *   1. Blanc            → fond principal des écrans, cartes, zones de contenu (dominant).
 *   2. Gris anthracite   → texte principal, informations essentielles.
 *   3. Bleu profond      → action principale : navigation, titres, boutons principaux, liens.
 *   4. Gris moyen        → texte secondaire, légendes, métadonnées, éléments désactivés.
 *   5. Bleu turquoise     → identité, sélection, surfaces secondaires.
 *   6. Rouge corail      → accent ponctuel, logo, notification — PAS un CTA par défaut (évoque
 *                          alerte/suppression sur mobile). Réservé à un usage rare et intentionnel.
 *   7. Dégradé turquoise → décor uniquement (bandeaux, écrans d'accueil) — jamais derrière du
 *                          texte courant.
 *
 * `primary`/`accent`/`turquoise` sont des couleurs de marque : identiques en clair/sombre,
 * seuls fonds et textes neutres s'adaptent au thème. Chacune a une variante `*Pressed` (légèrement
 * plus foncée) pour les états pressé/sélectionné, en plus du simple assombrissement par opacité.
 */
export const Palette = {
  turquoise: '#00E7C7',
  turquoisePressed: '#00B89F',
  deepBlue: '#0E74C7',
  deepBluePressed: '#0B5A9A',
  coral: '#E81E4E',
  coralPressed: '#B8163D',
  white: '#FFFFFF',
  anthracite: '#222222',
  midGrey: '#666666',
} as const;

export const Colors = {
  light: {
    text: Palette.anthracite,
    background: Palette.white,
    pageBackground: '#F9FAFB',
    backgroundElement: '#F3F4F6',
    backgroundSelected: '#E1FAF5',
    textSecondary: Palette.midGrey,
    primary: Palette.deepBlue,
    primaryPressed: Palette.deepBluePressed,
    accent: Palette.coral,
    accentPressed: Palette.coralPressed,
    turquoise: Palette.turquoise,
    turquoisePressed: Palette.turquoisePressed,
    // Teintes atténuées pour puces/pastilles (fond clair + texte coloré foncé), distinctes des
    // couleurs de marque pleines : évite qu'un badge inonde visuellement une carte.
    turquoiseTint: '#E1FAF5',
    turquoiseTintText: '#036B5C',
    coralTint: '#FDEAEF',
    cardBorder: '#E5E7EB',
  },
  dark: {
    text: '#FFFFFF',
    background: '#15181C',
    pageBackground: '#0C0F12',
    backgroundElement: '#1C2126',
    backgroundSelected: '#22303D',
    textSecondary: '#A9AFB8',
    primary: Palette.deepBlue,
    primaryPressed: Palette.deepBluePressed,
    accent: Palette.coral,
    accentPressed: Palette.coralPressed,
    turquoise: Palette.turquoise,
    turquoisePressed: Palette.turquoisePressed,
    turquoiseTint: '#0D2B28',
    turquoiseTintText: '#4FE8D1',
    coralTint: '#341018',
    cardBorder: 'rgba(255,255,255,0.09)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Ombre de carte "élevée" (iOS: shadow*, Android: elevation), cohérente sur tout l'app. */
export const CardShadow = Platform.select({
  web: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
  },
  default: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
});

/**
 * Contrastes vérifiés (WCAG AA, seuil 4.5:1 texte normal / 3:1 texte large) :
 * - `turquoise` a un contraste très faible avec du texte blanc (~1.6:1) mais excellent avec
 *   du texte `anthracite` (~10:1) → toujours l'utiliser en fond avec du texte foncé dessus,
 *   jamais avec du texte blanc.
 * - `primary` (bleu profond) passe largement avec du texte blanc (~4.8:1) → fond de bouton sûr,
 *   c'est la couleur par défaut pour tout CTA principal.
 * - `accent` (corail) est juste sous le seuil AA avec du texte blanc en petite taille (~4.4:1) →
 *   réservé aux accents ponctuels/notifications, jamais comme couleur de CTA par défaut.
 */

/**
 * La charte recommande Calibri/Montserrat pour les supports imprimés, mais explicitement
 * la police système par défaut pour le numérique (compatibilité lecteurs d'écran) — c'est
 * déjà ce que fait la config ci-dessous, aucun changement nécessaire.
 */
export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/**
 * Échelle typographique de la charte mobile (§04) : 5 niveaux, échelle courte adaptée aux petits
 * écrans. `brand` est une exception hors charte, réservée au seul logotype "AAVIE" (aucune règle
 * officielle ne couvre le texte de marque, faute de fichier logo — voir CLAUDE.md).
 */
export const TypeScale = {
  brand: { fontSize: 30, fontWeight: 700, lineHeight: 36 },
  screenTitle: { fontSize: 24, fontWeight: 600, lineHeight: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 600, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: 400, lineHeight: 24 },
  label: { fontSize: 14, fontWeight: 600, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: 400, lineHeight: 16 },
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
