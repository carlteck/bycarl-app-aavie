import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { BudgetEntryForm } from '@/components/budget-entry-form';
import { BudgetEntryRow } from '@/components/budget-entry-row';
import { BudgetSummaryCard } from '@/components/budget-summary';
import { FilterChips } from '@/components/filter-chips';
import { PrimaryButton } from '@/components/primary-button';
import { EmptyState, LoadingState } from '@/components/screen-state';
import { StackScreen, useListInsets } from '@/components/stack-screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useSync } from '@/context/sync-context';
import { useBudget } from '@/hooks/use-budget';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import {
  inMonth,
  KIND_OPTIONS,
  monthKey,
  PERIOD_OPTIONS,
  summarize,
  type BudgetKind,
  type BudgetPeriod,
} from '@/lib/budget';
import { todayISO } from '@/lib/reminder-date';

const SYNC_TEXT = {
  waiting: '',
  syncing: 'Synchronisation en cours…',
  synced: 'Synchronisé avec votre compte.',
  pending:
    'Enregistré sur cet appareil, en attente de synchronisation avec votre compte.',
} as const;

export default function BudgetScreen() {
  const { entries, isLoaded, save, remove } = useBudget();
  const { status, retry } = useSync();
  const insets = useListInsets();
  const [period, setPeriod] = useState<BudgetPeriod>('month');
  const [kind, setKind] = useState<BudgetKind | 'all'>('all');
  const [form, setForm] = useState<'hidden' | 'new' | string>('hidden');

  const today = todayISO();
  const inPeriod = useMemo(() => {
    const key = monthKey(period, today);
    return entries.filter((entry) => inMonth(entry, key));
  }, [entries, period, today]);
  const summary = useMemo(() => summarize(inPeriod), [inPeriod]);
  const visible = useMemo(
    () =>
      kind === 'all'
        ? inPeriod
        : inPeriod.filter((entry) => entry.kind === kind),
    [inPeriod, kind],
  );

  const editing =
    form !== 'hidden' && form !== 'new'
      ? entries.find((entry) => entry.id === form)
      : undefined;

  const { refreshing, onRefresh } = usePullToRefresh(retry);

  const confirmDelete = () => {
    if (!editing) return;
    const removeIt = () => {
      remove(editing.id)
        .then(() => setForm('hidden'))
        .catch(() =>
          Alert.alert(
            'Suppression impossible',
            'L’opération n’a pas été supprimée sur cet appareil. Réessayez.',
          ),
        );
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`Supprimer « ${editing.label} » ?`)) removeIt();
      return;
    }
    Alert.alert(
      'Supprimer cette opération ?',
      `« ${editing.label} » sera retirée de votre budget.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: removeIt },
      ],
    );
  };

  if (form !== 'hidden' && (form === 'new' || editing)) {
    return (
      <StackScreen
        title={editing ? 'Modifier l’opération' : 'Nouvelle opération'}
        backLabel="Budget"
      >
        <ScrollView
          contentContainerStyle={insets}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <BudgetEntryForm
            key={editing?.id ?? 'new'}
            initialValue={editing}
            onSubmit={async (input) => {
              await save(input, editing?.id);
              setForm('hidden');
            }}
            onCancel={() => setForm('hidden')}
            onDelete={editing ? confirmDelete : undefined}
          />
        </ScrollView>
      </StackScreen>
    );
  }

  const periodLabel =
    PERIOD_OPTIONS.find((option) => option.value === period)?.label ?? '';

  return (
    <StackScreen title="Gestion de budget">
      <FlatList
        data={isLoaded ? visible : []}
        keyExtractor={(entry) => entry.id}
        renderItem={({ item }) => (
          <BudgetEntryRow entry={item} onPress={() => setForm(item.id)} />
        )}
        contentContainerStyle={insets}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <BudgetSummaryCard summary={summary} periodLabel={periodLabel} />
            <PrimaryButton icon="add" onPress={() => setForm('new')}>
              Ajouter une opération
            </PrimaryButton>
            <FilterChips
              options={PERIOD_OPTIONS}
              value={period}
              onChange={setPeriod}
              label="Filtrer par période"
            />
            <FilterChips
              options={KIND_OPTIONS}
              value={kind}
              onChange={setKind}
              label="Filtrer par type d’opération"
            />
            <ThemedText
              type="caption"
              themeColor="textSecondary"
              accessibilityLiveRegion="polite"
            >
              {visible.length} opération{visible.length > 1 ? 's' : ''}
              {SYNC_TEXT[status] ? ` · ${SYNC_TEXT[status]}` : ''}
            </ThemedText>
          </View>
        }
        ListEmptyComponent={
          !isLoaded ? (
            <LoadingState label="Chargement de votre budget…" />
          ) : entries.length === 0 ? (
            <EmptyState
              icon="wallet-outline"
              title="Votre budget est vide"
              message="Notez vos revenus et vos dépenses pour voir ce qu’il vous reste. Aucune donnée bancaire n’est demandée."
              action={{
                label: 'Ajouter ma première opération',
                onPress: () => setForm('new'),
              }}
            />
          ) : (
            <EmptyState
              icon="funnel-outline"
              title="Aucune opération ici"
              message="Aucune opération ne correspond à ces filtres. Changez de période ou de type."
            />
          )
        }
      />
    </StackScreen>
  );
}

const styles = StyleSheet.create({ header: { gap: Spacing.three } });
