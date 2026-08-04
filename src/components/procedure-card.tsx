import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconChip } from './icon-chip';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import type { Procedure } from '@/constants/procedures';
import { CardShadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ProcedureCardProps = {
  procedure: Procedure;
  onPress: () => void;
};

export function ProcedureCard({ procedure, onPress }: ProcedureCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${procedure.title}, ${procedure.durationEstimate}`}
      style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView type="background" style={[styles.card, CardShadow, { borderColor: theme.cardBorder }]}>
        <IconChip name={procedure.icon} variant="turquoise" />
        <View style={styles.body}>
          <ThemedText type="sectionTitle">{procedure.title}</ThemedText>
          <ThemedText themeColor="textSecondary" numberOfLines={2}>
            {procedure.summary}
          </ThemedText>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color={theme.textSecondary} />
              <ThemedText type="caption" themeColor="textSecondary">
                {procedure.durationEstimate}
              </ThemedText>
            </View>
            {procedure.cerfaNumber && (
              <View style={styles.metaItem}>
                <Ionicons name="document-text-outline" size={13} color={theme.textSecondary} />
                <ThemedText type="caption" themeColor="textSecondary">
                  {procedure.cerfaNumber}
                </ThemedText>
              </View>
            )}
            <View style={styles.metaItem}>
              <Ionicons
                name={procedure.online ? 'wifi-outline' : 'business-outline'}
                size={13}
                color={theme.textSecondary}
              />
              <ThemedText type="caption" themeColor="textSecondary">
                {procedure.online ? 'En ligne' : 'Sur place'}
              </ThemedText>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
});
