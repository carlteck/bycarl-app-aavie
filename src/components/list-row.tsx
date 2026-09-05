import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconChip } from './icon-chip';
import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ListRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  /** Élément affiché à droite (ex. `<Switch />`) ; par défaut un chevron si `onPress` est fourni. */
  trailing?: ReactNode;
  /** Action destructive/sensible : icône et libellé en corail (accent d'alerte, cf. charte §02). */
  danger?: boolean;
};

/** Ligne de liste groupée façon Réglages : puce d'icône, libellé, élément de fin. */
export function ListRow({
  icon,
  label,
  onPress,
  trailing,
  danger,
}: ListRowProps) {
  const theme = useTheme();

  const content = (
    <View style={styles.row}>
      <IconChip name={icon} variant={danger ? 'coral' : 'primary'} size={30} />
      <ThemedText
        type="label"
        style={[styles.label, danger ? { color: theme.accent } : undefined]}
        numberOfLines={1}
      >
        {label}
      </ThemedText>
      {trailing ??
        (onPress && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.textSecondary}
          />
        ))}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    minHeight: 44,
  },
  label: {
    flex: 1,
  },
  pressed: {
    opacity: 0.6,
  },
});
