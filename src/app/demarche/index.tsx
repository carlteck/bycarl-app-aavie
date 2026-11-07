import { ScrollView, StyleSheet, View } from 'react-native';

import { AssistantPromptCard } from '@/components/assistant-prompt-card';
import { ErrorState, LoadingState } from '@/components/screen-state';
import { StackScreen, useListInsets } from '@/components/stack-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CardShadow, Spacing } from '@/constants/theme';
import { useRemoteResource } from '@/hooks/use-remote-resource';
import { formatDay } from '@/lib/remote-values';
import { fetchTrackedProcedures } from '@/lib/tracked-procedures';

const STATUS = { a_jour: 'À jour', action_requise: 'Action requise', en_retard: 'En retard' } as const;

export default function DemarcheCatalogueScreen() {
  const procedures = useRemoteResource(fetchTrackedProcedures);
  const insets = useListInsets();

  return (
    <StackScreen title="Mes démarches" backLabel="Accueil">
      {procedures.status === 'loading' ? <LoadingState label="Chargement de vos démarches…" /> : procedures.data === null ? (
        <ErrorState kind={procedures.error ?? 'unknown'} onRetry={procedures.retry} />
      ) : <ScrollView contentContainerStyle={insets}>
        {procedures.data.map((procedure) => (
          <ThemedView key={procedure.id} type="background" style={[styles.card, CardShadow]}>
            <View style={styles.row}>
              <ThemedText type="sectionTitle" style={styles.title}>{procedure.title}</ThemedText>
              <ThemedText type="caption" themeColor={procedure.status === 'en_retard' ? 'accent' : 'textSecondary'}>{STATUS[procedure.status]}</ThemedText>
            </View>
            <ThemedText themeColor="textSecondary">Avancement : {procedure.progress} %</ThemedText>
            {procedure.deadlineDate ? <ThemedText type="caption">{procedure.deadlineTitle ?? 'Échéance'} : {formatDay(procedure.deadlineDate)}</ThemedText> : null}
            {procedure.steps.map((step) => <ThemedText key={`${procedure.id}-${step.title}`} type="caption" themeColor="textSecondary">{step.status === 'done' ? '✓' : '•'} {step.title}</ThemedText>)}
          </ThemedView>
        ))}
        <AssistantPromptCard />
      </ScrollView>}
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.two, padding: Spacing.three, borderRadius: 18 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  title: { flex: 1 },
});
