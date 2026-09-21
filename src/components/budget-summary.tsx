import { StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

import { CardShadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCents, type BudgetSummary } from '@/lib/budget';

/** Solde, revenus et dépenses de la période. Annoncé d'un seul bloc par les lecteurs d'écran. */
export function BudgetSummaryCard({
  summary,
  periodLabel,
}: {
  summary: BudgetSummary;
  periodLabel: string;
}) {
  const theme = useTheme();
  const negative = summary.balanceCents < 0;
  return (
    <View
      accessible
      accessibilityLabel={`${periodLabel}. Solde ${formatCents(summary.balanceCents)}${negative ? ', négatif' : ''}. Revenus ${formatCents(summary.incomeCents)}. Dépenses ${formatCents(summary.expenseCents)}.`}
      style={[
        styles.card,
        CardShadow,
        { backgroundColor: theme.background, borderColor: theme.cardBorder },
      ]}
    >
      <ThemedText type="caption" themeColor="textSecondary">
        Solde · {periodLabel}
      </ThemedText>
      <ThemedText
        style={styles.balance}
        themeColor={negative ? 'accent' : 'text'}
      >
        {formatCents(summary.balanceCents)}
      </ThemedText>
      <View style={styles.split}>
        <View style={[styles.cell, { backgroundColor: theme.turquoiseTint }]}>
          <ThemedText type="caption" themeColor="turquoiseTintText">
            Revenus
          </ThemedText>
          <ThemedText type="label" themeColor="turquoiseTintText">
            {formatCents(summary.incomeCents)}
          </ThemedText>
        </View>
        <View style={[styles.cell, { backgroundColor: theme.coralTint }]}>
          <ThemedText type="caption" themeColor="accent">
            Dépenses
          </ThemedText>
          <ThemedText type="label" themeColor="accent">
            {formatCents(summary.expenseCents)}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: 24,
    borderWidth: 1,
  },
  balance: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  split: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  cell: {
    flexGrow: 1,
    flexBasis: 140,
    gap: Spacing.half,
    padding: Spacing.three,
    borderRadius: 16,
  },
});
