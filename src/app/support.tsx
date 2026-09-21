import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { FilterChips } from '@/components/filter-chips';
import { PrimaryButton } from '@/components/primary-button';
import {
  EmptyState,
  ErrorState,
  InlineError,
  LoadingState,
} from '@/components/screen-state';
import { StackScreen, useListInsets } from '@/components/stack-screen';
import { SupportStatusBadge } from '@/components/support-status-badge';
import { ThemedText } from '@/components/themed-text';
import { CardShadow, Spacing } from '@/constants/theme';
import { useSupportTickets } from '@/hooks/use-support';
import { useTheme } from '@/hooks/use-theme';
import { formatInstant } from '@/lib/remote-values';
import {
  TICKET_CATEGORIES,
  type StatusFilter,
  type SupportTicket,
} from '@/lib/support';

const FILTERS: readonly { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'open', label: 'Ouvertes' },
  { value: 'pending', label: 'En attente' },
  { value: 'resolved', label: 'Résolues' },
  { value: 'closed', label: 'Fermées' },
];

const categoryLabel = (ticket: SupportTicket) =>
  TICKET_CATEGORIES.find((item) => item.value === ticket.category)?.label ?? '';

function TicketRow({ ticket }: { ticket: SupportTicket }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => router.push(`/support/${ticket.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${ticket.subject}. ${categoryLabel(ticket)}. Dernier échange le ${formatInstant(ticket.lastMessageAt)}.`}
      accessibilityHint="Ouvre la demande et ses messages"
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
      <ThemedText type="label" numberOfLines={2}>
        {ticket.subject}
      </ThemedText>
      <SupportStatusBadge status={ticket.status} />
      <ThemedText type="caption" themeColor="textSecondary">
        {categoryLabel(ticket)} · {formatInstant(ticket.lastMessageAt)}
      </ThemedText>
    </Pressable>
  );
}

export default function SupportScreen() {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const list = useSupportTickets(filter);
  const insets = useListInsets();

  // Au retour d'une demande créée ou close, la liste se met à jour ; pas au premier affichage,
  // déjà couvert par le chargement initial.
  const refreshRef = useRef(list.refresh);
  useEffect(() => {
    refreshRef.current = list.refresh;
  }, [list.refresh]);
  const seen = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (seen.current) refreshRef.current();
      seen.current = true;
    }, []),
  );

  return (
    <StackScreen title="Support">
      <FlatList
        data={list.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TicketRow ticket={item} />}
        contentContainerStyle={insets}
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={list.refreshing}
            onRefresh={list.refresh}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText themeColor="textSecondary">
              Décrivez ce qui vous bloque : l’équipe AAVIE vous répond ici.
            </ThemedText>
            <PrimaryButton
              icon="add"
              onPress={() => router.push('/support/nouvelle')}
            >
              Nouvelle demande
            </PrimaryButton>
            <FilterChips
              options={FILTERS}
              value={filter}
              onChange={setFilter}
              label="Filtrer les demandes par statut"
            />
            {list.status === 'ready' && list.error ? (
              <InlineError kind={list.error} onRetry={list.refresh} />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          list.status === 'loading' ? (
            <LoadingState label="Chargement de vos demandes…" />
          ) : list.status === 'error' && list.error ? (
            <ErrorState kind={list.error} onRetry={list.retry} />
          ) : (
            <EmptyState
              icon="chatbox-ellipses-outline"
              title={
                filter === 'all'
                  ? 'Aucune demande pour le moment'
                  : 'Aucune demande dans cette catégorie'
              }
              message={
                filter === 'all'
                  ? 'Quand vous aurez besoin d’aide, vos demandes et nos réponses apparaîtront ici.'
                  : 'Essayez un autre filtre pour voir vos autres demandes.'
              }
            />
          )
        }
        ListFooterComponent={
          list.loadingMore ? (
            <ActivityIndicator accessibilityLabel="Chargement de la suite" />
          ) : null
        }
      />
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.three },
  row: {
    gap: Spacing.two,
    padding: Spacing.three,
    minHeight: 72,
    borderRadius: 18,
    borderWidth: 1,
  },
});
