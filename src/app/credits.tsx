import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ScreenHeaderBar } from '@/components/screen-header-bar';
import { EmptyState, ErrorState, LoadingState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRemoteResource } from '@/hooks/use-remote-resource';
import { fetchCreditsOverview } from '@/lib/credits';
import { formatInstant } from '@/lib/remote-values';
import { Spacing } from '@/constants/theme';

export default function CreditsScreen() {
  const credits = useRemoteResource(fetchCreditsOverview);
  return (
    <ThemedView type="pageBackground" style={styles.screen}>
      <ScreenHeaderBar
        title="Mes crédits"
        onBack={() => router.back()}
        backLabel="Mon compte"
      />
      {credits.status === 'loading' ? (
        <LoadingState label="Chargement de vos crédits…" />
      ) : credits.data === null ? (
        <ErrorState kind={credits.error ?? 'unknown'} onRetry={credits.retry} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="screenTitle">
            {credits.data.balance === null ? 'Crédits illimités' : `${credits.data.balance} crédits`}
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            {credits.data.planName ? `Forfait ${credits.data.planName} · ` : ''}
            {credits.data.monthlyCredits} crédits attribués chaque mois
          </ThemedText>
          <ThemedText type="sectionTitle">Historique</ThemedText>
          {credits.data.history.length === 0 ? (
            <EmptyState icon="receipt-outline" title="Aucun mouvement" message="Vos utilisations et attributions de crédits apparaîtront ici." />
          ) : credits.data.history.map((entry) => (
            <View key={entry.id} style={styles.entry}>
              <View style={styles.entryText}>
                <ThemedText type="label">{entry.label}</ThemedText>
                <ThemedText type="caption" themeColor="textSecondary">{formatInstant(entry.createdAt)}</ThemedText>
              </View>
              <ThemedText type="label">{entry.delta > 0 ? '+' : ''}{entry.delta}</ThemedText>
            </View>
          ))}
        </ScrollView>
      )}
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  entry: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  entryText: { flex: 1, gap: Spacing.half },
});
