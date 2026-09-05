import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconChip } from '@/components/icon-chip';
import { ScreenHeaderBar } from '@/components/screen-header-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import { CardShadow, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CreditReason = 'grant' | 'spend' | 'refund' | 'gift' | 'purchase' | 'expiry';

interface CreditsResponse {
  balance: number | null;
  monthly_credits: number;
  rollover_months: number;
  plan_name: string | null;
  tariff: { action_key: string; label: string; description: string; cost: number }[];
  history: {
    id: string;
    delta: number;
    reason: CreditReason;
    action_key: string | null;
    label: string;
    created_at: string;
  }[];
}

const REASON_LABEL: Record<CreditReason, string> = {
  grant: 'Attribution',
  spend: 'Utilisation',
  refund: 'Remboursement',
  gift: 'Geste commercial',
  purchase: 'Achat',
  expiry: 'Expiration',
};

/**
 * Solde, grille tarifaire et historique — même endpoint `credits.php` que le site, donc le même
 * solde des deux côtés. Les trois blocs vont ensemble : un solde sans le prix des actions ni le
 * détail des mouvements ne permet pas de comprendre pourquoi il a baissé.
 *
 * ⚠️ Aucun achat de crédits ici. Un pack vendu dans l'application est un « consumable in-app
 * purchase » au sens d'Apple : achat in-app obligatoire, commission de 15 à 30 %, et interdiction
 * de renvoyer vers un paiement web. Tant que la question n'est pas tranchée, cet écran consomme
 * et affiche, il ne vend pas — et ne mentionne aucun autre moyen de payer.
 */
export default function CreditsScreen() {
  const { refreshUser } = useAuth();
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();

  const [data, setData] = useState<CreditsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await apiFetch<CreditsResponse>('/credits.php'));
      setError(null);
    } catch {
      setError('Impossible de récupérer votre solde. Réessayez dans un instant.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement réseau à l'ouverture
    load();
    // Le solde a pu changer pendant que l'écran était fermé (question posée, geste commercial).
    refreshUser();
  }, [load, refreshUser]);

  return (
    <ThemedView style={styles.screen}>
      <ScreenHeaderBar title="Mes crédits" onBack={() => router.back()} backLabel="Profil" />

      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingLeft: Spacing.four + safeAreaInsets.left,
            paddingRight: Spacing.four + safeAreaInsets.right,
            paddingBottom: safeAreaInsets.bottom + Spacing.four,
          },
        ]}>
        <View style={styles.container}>
          {isLoading && <ThemedText themeColor="textSecondary">Chargement…</ThemedText>}

          {error && (
            <ThemedText type="label" themeColor="accent">
              {error}
            </ThemedText>
          )}

          {data && data.balance === null && (
            <View style={[styles.card, { borderColor: theme.cardBorder }, CardShadow]}>
              <ThemedText type="sectionTitle">Compte administrateur</ThemedText>
              <ThemedText themeColor="textSecondary">
                Votre compte n’est pas décompté : les actions restent tracées, mais aucun crédit
                n’est consommé.
              </ThemedText>
            </View>
          )}

          {data && data.balance !== null && (
            <>
              <View style={[styles.balanceCard, { backgroundColor: theme.turquoiseTint }]}>
                <ThemedText type="label" themeColor="turquoiseTintText">
                  Solde disponible
                </ThemedText>
                <ThemedText type="screenTitle" themeColor="turquoiseTintText">
                  {data.balance} crédit{data.balance > 1 ? 's' : ''}
                </ThemedText>
                <ThemedText type="caption" themeColor="turquoiseTintText">
                  {data.monthly_credits} crédits vous sont attribués chaque mois
                  {data.plan_name ? ` avec le forfait ${data.plan_name}` : ''}.{' '}
                  {data.rollover_months > 0
                    ? `Les crédits non utilisés se reportent jusqu’à ${data.rollover_months} mois.`
                    : 'Les crédits non utilisés expirent à la fin du mois.'}
                </ThemedText>
              </View>

              <View style={styles.section}>
                <ThemedText type="sectionTitle">Ce que coûte chaque action</ThemedText>
                {data.tariff.map((action) => (
                  <View
                    key={action.action_key}
                    style={[
                      styles.row,
                      { borderColor: theme.cardBorder, backgroundColor: theme.background },
                      CardShadow,
                    ]}>
                    <IconChip name="flash-outline" />
                    <View style={styles.rowText}>
                      <ThemedText type="label">{action.label}</ThemedText>
                      <ThemedText type="caption" themeColor="textSecondary">
                        {action.description}
                      </ThemedText>
                    </View>
                    <ThemedText type="label" themeColor="primary">
                      {action.cost}
                    </ThemedText>
                  </View>
                ))}
                <ThemedText type="caption" themeColor="textSecondary">
                  L’annuaire, les ressources, la veille, le planificateur, le budget et le
                  coffre-fort restent gratuits.
                </ThemedText>
              </View>

              {data.history.length > 0 && (
                <View style={styles.section}>
                  <ThemedText type="sectionTitle">Derniers mouvements</ThemedText>
                  {data.history.slice(0, 15).map((entry) => (
                    <View
                      key={entry.id}
                      style={[styles.historyRow, { borderBottomColor: theme.cardBorder }]}>
                      <View style={styles.rowText}>
                        <ThemedText type="label" numberOfLines={1}>
                          {entry.label}
                        </ThemedText>
                        <ThemedText type="caption" themeColor="textSecondary">
                          {REASON_LABEL[entry.reason]} ·{' '}
                          {new Date(entry.created_at).toLocaleDateString('fr-FR')}
                        </ThemedText>
                      </View>
                      <ThemedText
                        type="label"
                        themeColor={entry.delta > 0 ? 'turquoiseTintText' : 'textSecondary'}>
                        {entry.delta > 0 ? '+' : ''}
                        {entry.delta}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: Spacing.four,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  balanceCard: {
    gap: Spacing.one,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.four,
  },
  rowText: {
    flex: 1,
    gap: Spacing.half,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
