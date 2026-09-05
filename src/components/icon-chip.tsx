import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IconChipVariant = 'turquoise' | 'primary' | 'coral';

type IconChipProps = {
  name: keyof typeof Ionicons.glyphMap;
  variant?: IconChipVariant;
  size?: number;
  style?: ViewStyle;
};

/** Pastille d'icône ronde/arrondie utilisée en tête de carte, de ligne ou d'écran. */
export function IconChip({
  name,
  variant = 'turquoise',
  size = 34,
  style,
}: IconChipProps) {
  const theme = useTheme();

  const background =
    variant === 'primary'
      ? theme.primary
      : variant === 'coral'
        ? theme.coralTint
        : theme.turquoiseTint;
  // `primary` est un fond bleu fixe (identique en thème sombre) : l'icône doit rester blanche,
  // jamais `theme.background` (qui devient noir en sombre et rendrait l'icône invisible).
  const iconColor =
    variant === 'primary'
      ? Palette.white
      : variant === 'coral'
        ? theme.accent
        : theme.turquoiseTintText;

  return (
    <View
      style={[
        styles.chip,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          backgroundColor: background,
        },
        style,
      ]}
    >
      <Ionicons name={name} size={size * 0.52} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
