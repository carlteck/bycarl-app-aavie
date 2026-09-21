import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { OutlineButton } from '@/components/outline-button';
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
import { useAuth } from '@/context/auth-context';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useSupportThread } from '@/hooks/use-support';
import { useTheme } from '@/hooks/use-theme';
import { classifyRemoteError, remoteErrorMessage } from '@/lib/remote-error';
import { asId, formatInstant } from '@/lib/remote-values';
import {
  closeTicket,
  MESSAGE_MAX,
  sendMessage,
  STATUS_META,
  type SupportMessage,
} from '@/lib/support';

function MessageBubble({ message }: { message: SupportMessage }) {
  const theme = useTheme();
  const mine = message.author === 'user';
  const who = mine ? 'Vous' : 'Équipe AAVIE';
  return (
    <View
      accessible
      accessibilityLabel={`${who}, ${formatInstant(message.createdAt)}. ${message.body}`}
      style={[
        styles.bubble,
        mine ? styles.mine : styles.theirs,
        {
          backgroundColor: mine ? theme.turquoiseTint : theme.background,
          borderColor: theme.cardBorder,
        },
        mine ? null : CardShadow,
      ]}
    >
      <ThemedText
        type="caption"
        themeColor={mine ? 'turquoiseTintText' : 'textSecondary'}
        style={styles.who}
      >
        {who} · {formatInstant(message.createdAt)}
      </ThemedText>
      <ThemedText selectable>{message.body}</ThemedText>
    </View>
  );
}

export default function SupportTicketScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const ticketId = asId(params.id);
  return (
    <StackScreen title="Ma demande" backLabel="Support">
      {ticketId ? (
        <Thread ticketId={ticketId} />
      ) : (
        <EmptyState
          icon="alert-circle-outline"
          title="Demande introuvable"
          message="Ce lien ne correspond à aucune de vos demandes."
        />
      )}
    </StackScreen>
  );
}

function Thread({ ticketId }: { ticketId: string }) {
  const { user } = useAuth();
  const theme = useTheme();
  const insets = useListInsets();
  const thread = useSupportThread(ticketId);
  const { refreshing, onRefresh } = usePullToRefresh(thread.reload);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (thread.status === 'loading')
    return <LoadingState label="Chargement de la demande…" />;
  if (thread.status === 'missing')
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Demande introuvable"
        message="Elle n’existe plus ou ne vous appartient pas."
      />
    );
  if (thread.data === null)
    return (
      <ErrorState kind={thread.error ?? 'unknown'} onRetry={thread.retry} />
    );

  const { ticket, messages } = thread.data;
  const closed = ticket.status === 'closed';

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setActionError(null);
    try {
      await action();
      thread.reload();
    } catch (failure) {
      setActionError(remoteErrorMessage(classifyRemoteError(failure)));
    } finally {
      setBusy(false);
    }
  };

  const send = () => {
    if (!user || busy || reply.trim().length === 0) return;
    void run(async () => {
      await sendMessage(user.id, ticket.id, reply);
      setReply('');
    });
  };

  const confirmClose = () => {
    const close = () => void run(() => closeTicket(ticket.id));
    if (Platform.OS === 'web') {
      if (
        window.confirm(
          'Fermer cette demande ? Vous ne pourrez plus y répondre.',
        )
      )
        close();
      return;
    }
    Alert.alert(
      'Fermer cette demande ?',
      'Vous ne pourrez plus y répondre. Vous pourrez toujours en ouvrir une nouvelle.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Fermer', style: 'destructive', onPress: close },
      ],
    );
  };

  return (
    <ScrollView
      contentContainerStyle={insets}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
        />
      }
    >
      <View style={styles.summary}>
        <ThemedText type="sectionTitle" accessibilityRole="header">
          {ticket.subject}
        </ThemedText>
        <SupportStatusBadge status={ticket.status} />
        <ThemedText type="caption" themeColor="textSecondary">
          {STATUS_META[ticket.status].hint}
        </ThemedText>
      </View>

      {thread.error ? (
        <InlineError kind={thread.error} onRetry={thread.reload} />
      ) : null}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {closed ? null : (
        <View style={styles.composer}>
          <TextInput
            value={reply}
            onChangeText={setReply}
            maxLength={MESSAGE_MAX}
            multiline
            editable={!busy}
            textAlignVertical="top"
            placeholder="Écrire une réponse…"
            placeholderTextColor={theme.textSecondary}
            accessibilityLabel="Votre réponse"
            style={[
              styles.input,
              {
                color: theme.text,
                borderColor: theme.cardBorder,
                backgroundColor: theme.background,
              },
            ]}
          />
          {actionError ? (
            <ThemedText
              themeColor="accent"
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
            >
              {actionError}
            </ThemedText>
          ) : null}
          <PrimaryButton
            icon="paper-plane-outline"
            disabled={busy || reply.trim().length === 0}
            onPress={send}
          >
            {busy ? 'Envoi en cours…' : 'Envoyer'}
          </PrimaryButton>
          <OutlineButton icon="lock-closed-outline" onPress={confirmClose}>
            Fermer la demande
          </OutlineButton>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  summary: { gap: Spacing.two },
  bubble: {
    maxWidth: '92%',
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: 18,
    borderWidth: 1,
  },
  mine: { alignSelf: 'flex-end' },
  theirs: { alignSelf: 'flex-start' },
  who: { fontWeight: '600' },
  composer: { gap: Spacing.three, paddingTop: Spacing.two },
  input: {
    minHeight: 110,
    fontSize: 16,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: 10,
  },
});
