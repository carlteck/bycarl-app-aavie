import { StyleSheet, View } from 'react-native';

import { IconChip } from './icon-chip';
import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { CreditBalance } from '@/lib/assistant';

/**
 * Solde de crédits publié par le site (lecture seule). Trois états honnêtes : chargement, solde
 * connu, solde indisponible — jamais un « 0 » inventé quand la donnée manque.
 */
export function CreditsBadge({
  loading,
  credits,
}: {
  loading: boolean;
  credits: CreditBalance | null;
}) {
  const theme = useTheme();
  const text = loading
    ? 'Solde de crédits en cours de chargement…'
    : credits
      ? `${credits.balance} crédit${Math.abs(credits.balance) > 1 ? 's' : ''} restant${Math.abs(credits.balance) > 1 ? 's' : ''} sur ${credits.monthlyAllowance} ce mois-ci`
      : 'Solde de crédits indisponible pour le moment';
  return (
    <View
      accessible
      accessibilityLabel={text}
      style={[styles.box, { backgroundColor: theme.turquoiseTint }]}
    >
      <IconChip name="flash-outline" size={32} />
      <View style={styles.text}>
        <ThemedText type="label" themeColor="turquoiseTintText">
          {text}
        </ThemedText>
        {credits?.planLabel ? (
          <ThemedText type="caption" themeColor="turquoiseTintText">
            Forfait {credits.planLabel}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 16,
  },
  text: { flex: 1 },
});
