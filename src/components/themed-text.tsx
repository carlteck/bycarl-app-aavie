import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor, TypeScale } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Échelle typographique de la charte mobile (§04) : `screenTitle` (titre d'écran),
 * `sectionTitle` (titre de section), `body` (corps de texte, par défaut), `label` (libellé
 * court, ex. boutons/badges), `caption` (légende/métadonnée). `brand` est réservé au logotype
 * "AAVIE". `link`/`linkPrimary`/`code` restent des styles utilitaires hors échelle éditoriale.
 */
export type ThemedTextProps = TextProps & {
  type?: 'brand' | 'screenTitle' | 'sectionTitle' | 'body' | 'label' | 'caption' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'body', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const resolvedColor = themeColor ?? (type === 'linkPrimary' ? 'primary' : 'text');

  return (
    <Text
      style={[
        { color: theme[resolvedColor] },
        type === 'brand' && styles.brand,
        type === 'screenTitle' && styles.screenTitle,
        type === 'sectionTitle' && styles.sectionTitle,
        type === 'body' && styles.body,
        type === 'label' && styles.label,
        type === 'caption' && styles.caption,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  brand: TypeScale.brand,
  screenTitle: TypeScale.screenTitle,
  sectionTitle: TypeScale.sectionTitle,
  body: TypeScale.body,
  label: TypeScale.label,
  caption: TypeScale.caption,
  link: {
    lineHeight: 20,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 20,
    fontSize: 14,
    fontWeight: 600,
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
