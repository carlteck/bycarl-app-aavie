import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CreditsBadge } from '@/components/credits-badge';
import { PrimaryButton } from '@/components/primary-button';
import {
  EmptyState,
  ErrorState,
  InlineError,
  LoadingState,
} from '@/components/screen-state';
import { StackScreen, useListInsets } from '@/components/stack-screen';
import { ThemedText } from '@/components/themed-text';
import { CardShadow, Spacing } from '@/constants/theme';
import { useAssistantConversations, useCredits } from '@/hooks/use-assistant';
import { useTheme } from '@/hooks/use-theme';
import {
  deleteConversation,
  type AssistantConversation,
} from '@/lib/assistant';
import { formatInstant } from '@/lib/remote-values';

function ConversationRow({
  conversation,
  onDelete,
}: {
  conversation: AssistantConversation;
  onDelete: () => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.row,
        CardShadow,
        { backgroundColor: theme.background, borderColor: theme.cardBorder },
      ]}
    >
      <Pressable
        onPress={() => router.push(`/assistant/${conversation.id}`)}
        accessibilityRole="button"
        accessibilityLabel={`${conversation.title}. Dernier échange le ${formatInstant(conversation.lastMessageAt)}.`}
        accessibilityHint="Ouvre la conversation"
        style={({ pressed }) => [
          styles.rowMain,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <ThemedText type="label" numberOfLines={2}>
          {conversation.title}
        </ThemedText>
        <ThemedText type="caption" themeColor="textSecondary">
          {formatInstant(conversation.lastMessageAt)}
        </ThemedText>
      </Pressable>
      <Pressable
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel={`Supprimer la conversation ${conversation.title}`}
        style={styles.trash}
      >
        <Ionicons name="trash-outline" size={20} color={theme.accent} />
      </Pressable>
    </View>
  );
}

export default function AssistantScreen() {
  const list = useAssistantConversations();
  const credits = useCredits();
  const insets = useListInsets();

  // Au retour d'une conversation (créée, supprimée), la liste et le solde sont relus.
  const latest = useRef({ list: list.refresh, credits: credits.reload });
  useEffect(() => {
    latest.current = { list: list.refresh, credits: credits.reload };
  }, [list.refresh, credits.reload]);
  const seen = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (seen.current) {
        latest.current.list();
        void latest.current.credits();
      }
      seen.current = true;
    }, []),
  );

  const confirmDelete = (conversation: AssistantConversation) => {
    const remove = () => {
      deleteConversation(conversation.id)
        .then(() => list.refresh())
        .catch(() =>
          Alert.alert(
            'Suppression impossible',
            'La conversation n’a pas été supprimée. Réessayez.',
          ),
        );
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`Supprimer « ${conversation.title} » ?`)) remove();
      return;
    }
    Alert.alert(
      'Supprimer cette conversation ?',
      'Tous ses messages seront effacés définitivement.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: remove },
      ],
    );
  };

  return (
    <StackScreen title="Assistant administratif">
      <FlatList
        data={list.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationRow
            conversation={item}
            onDelete={() => confirmDelete(item)}
          />
        )}
        contentContainerStyle={insets}
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={list.refreshing}
            onRefresh={() => {
              list.refresh();
              void credits.reload();
            }}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText themeColor="textSecondary">
              Posez vos questions avec vos mots : l’assistant vous guide une
              étape à la fois.
            </ThemedText>
            <CreditsBadge
              loading={credits.status === 'loading'}
              credits={credits.data}
            />
            <PrimaryButton
              icon="add"
              onPress={() => router.push('/assistant/nouvelle')}
            >
              Nouvelle conversation
            </PrimaryButton>
            {list.status === 'ready' && list.error ? (
              <InlineError kind={list.error} onRetry={list.refresh} />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          list.status === 'loading' ? (
            <LoadingState label="Chargement de vos conversations…" />
          ) : list.status === 'error' && list.error ? (
            <ErrorState kind={list.error} onRetry={list.retry} />
          ) : (
            <EmptyState
              icon="chatbubbles-outline"
              title="Aucune conversation"
              message="Vos échanges avec l’assistant seront conservés ici, pour les retrouver quand vous voulez."
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
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 64,
  },
  rowMain: { flex: 1, gap: Spacing.half, padding: Spacing.three },
  trash: {
    width: 56,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
