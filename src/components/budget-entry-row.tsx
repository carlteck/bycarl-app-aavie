import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

import { CardShadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCents, KIND_LABEL, type BudgetEntry } from '@/lib/budget';
import { formatISODateLong } from '@/lib/reminder-date';

/**
 * Le sens d'une opération est dit trois fois — icône, signe et mot lu par le lecteur d'écran —,
 * jamais par la seule couleur (charte §07).
 */
export function BudgetEntryRow({
  entry,
  onPress,
}: {
  entry: BudgetEntry;
  onPress: () => void;
}) {
  const theme = useTheme();
  const income = entry.kind === 'income';
  const amount = formatCents(entry.amountCents, income ? '+' : '−');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${KIND_LABEL[entry.kind]}, ${entry.label}, ${amount.replace('−', 'moins ').replace('+', 'plus ')}, ${formatISODateLong(entry.dateISO)}, catégorie ${entry.category}`}
      accessibilityHint="Ouvre l’opération pour la modifier ou la supprimer"
      style={({ pressed }) => [
        styles.row,
        CardShadow,
        {
          backgroundColor: theme.background,
          borderColor: theme.cardBorder,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.icon,
          { backgroundColor: income ? theme.turquoiseTint : theme.coralTint },
        ]}
      >
        <Ionicons
          name={
            income ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'
          }
          size={22}
          color={income ? theme.turquoiseTintText : theme.accent}
        />
      </View>
      <View style={styles.body}>
        <ThemedText type="label" numberOfLines={2}>
          {entry.label}
        </ThemedText>
        <ThemedText type="caption" themeColor="textSecondary">
          {entry.category} · {formatISODateLong(entry.dateISO)}
        </ThemedText>
      </View>
      <ThemedText
        type="label"
        themeColor={income ? 'turquoiseTintText' : 'text'}
        style={styles.amount}
      >
        {amount}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 18,
    borderWidth: 1,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: Spacing.half },
  amount: { fontVariant: ['tabular-nums'] },
});
