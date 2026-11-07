import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CreditsBadge } from './credits-badge';
import { AssistantPromptCard } from './assistant-prompt-card';
import { PrimaryButton } from './primary-button';
import { useAuth } from '@/context/auth-context';
import { isAssistantEnabled } from '@/constants/assistant';
import { DictationButton, isDictationAvailable } from './dictation-button';
import { RichText } from './rich-text';
import { ErrorState, InlineError, LoadingState } from './screen-state';
import { SpeakButton } from './speak-button';
import { ThemedText } from './themed-text';

import { MaxContentWidth, Palette, Spacing } from '@/constants/theme';
import { useAssistantThread, useCredits } from '@/hooks/use-assistant';
import { useAssistantInitialMessage } from '@/hooks/use-assistant-initial-message';
import { useTheme } from '@/hooks/use-theme';
import {
  ASSISTANT_TIMEOUT_MS,
  AssistantError,
  assistantErrorMessage,
  QUESTION_MAX,
  sendAssistantMessage,
  type AssistantMessage,
} from '@/lib/assistant';
import { formatInstant } from '@/lib/remote-values';
import {
  prepareAssistantRequest,
  type AssistantRequest,
} from '@/lib/assistant-request';
import { markdownToPlainText } from '@/lib/simple-markdown';
import { assistantReply } from '@/lib/assistant-reply';
import {
  clearAssistantDraft,
  readAssistantDraft,
  setAssistantDraft,
  shouldSendAssistantDraft,
} from '@/lib/assistant-draft';
import { openExternalLink } from '@/lib/open-link';

const SUGGESTIONS = [
  'Comment renouveler ma carte d’identité ?',
  'Quels papiers pour une demande de logement ?',
  'Aide-moi à écrire un courrier à la CAF.',
];

const Bubble = memo(function Bubble({
  role,
  content,
  createdAt,
}: Pick<AssistantMessage, 'role' | 'content'> & { createdAt?: string }) {
  const theme = useTheme();
  const mine = role === 'user';
  const who = mine ? 'Vous' : 'Assistant AAVIE';
  const reply = assistantReply(content);
  return (
    <View
      style={[
        styles.bubble,
        mine ? styles.mine : styles.theirs,
        {
          backgroundColor: mine ? theme.turquoiseTint : theme.background,
          borderColor: theme.cardBorder,
        },
      ]}
    >
      <ThemedText
        type="caption"
        themeColor={mine ? 'turquoiseTintText' : 'textSecondary'}
        style={styles.who}
      >
        {who}
        {createdAt ? ` · ${formatInstant(createdAt)}` : ''}
      </ThemedText>
      {mine ? (
        <ThemedText selectable>{content}</ThemedText>
      ) : (
        <>
          {reply.text ? <RichText source={reply.text} /> : null}
          {reply.actionLabel ? (
            <View style={styles.intro}>
              <ThemedText type="label">{reply.actionLabel}</ThemedText>
              <ThemedText themeColor="textSecondary">
                {reply.actionStatus === 'confirmed'
                  ? 'Cette action a été confirmée sur votre compte AAVIE.'
                  : reply.actionStatus === 'cancelled'
                    ? 'Cette proposition a été annulée.'
                    : 'Cette proposition attend votre validation sur le site AAVIE. Aucune action n’a été effectuée.'}
              </ThemedText>
              {reply.actionStatus === 'pending' ? (
                <Pressable
                  accessibilityRole="link"
                  onPress={() =>
                    void openExternalLink(
                      'https://aavieapp.com/espace/assistant-administratif',
                    )
                  }
                  style={styles.suggestion}
                >
                  <ThemedText type="label" themeColor="primary">
                    Ouvrir l’assistant sur le site
                  </ThemedText>
                </Pressable>
              ) : null}
            </View>
          ) : null}
          {reply.text ? (
            <SpeakButton
              text={markdownToPlainText(reply.text)}
              accessibilityLabel="Écouter la réponse de l’assistant"
            />
          ) : null}
        </>
      )}
    </View>
  );
});

/**
 * Fil d'une conversation avec l'assistant (existante ou nouvelle si `conversationId` est nul).
 *
 * Le mobile envoie la question à l'API AAVIE, puis relit l'historique partagé avec le site.
 * Tant que la réponse n'est pas là, la question s'affiche à part,
 * et en cas d'échec elle revient dans le champ — l'usager ne retape rien.
 */
export function AssistantThread({
  conversationId,
}: {
  conversationId: string | null;
}) {
  return isAssistantEnabled ? (
    <ConnectedAssistantThread conversationId={conversationId} />
  ) : (
    <AssistantPromptCard />
  );
}

function ConnectedAssistantThread({
  conversationId,
}: {
  conversationId: string | null;
}) {
  const theme = useTheme();
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const thread = useAssistantThread(conversationId);
  const credits = useCredits();
  const [draft, setDraft] = useState(() =>
    conversationId ? '' : readAssistantDraft(),
  );
  const [sendInitialMessage] = useState(
    () => !conversationId && shouldSendAssistantDraft(),
  );
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accountRequired, setAccountRequired] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [dictationError, setDictationError] = useState('');
  const [offset, setOffset] = useState(0);
  const list = useRef<FlatList<AssistantMessage>>(null);
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  // Même identifiant tant que la MÊME question n'a pas abouti : un renvoi après coupure est
  // dédoublonnable côté serveur.
  const attempt = useRef<AssistantRequest | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    if (!conversationId) clearAssistantDraft();
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, [conversationId]);

  const reloadThread = thread.reload;
  const reloadCredits = credits.reload;
  const exhausted = credits.data?.balance != null && credits.data.balance <= 0;
  const sending = pending !== null;

  const send = useCallback(
    async (submittedText?: string) => {
      const text = (submittedText ?? draft).trim();
      if (!text || sending || exhausted || inFlight.current) return;
      inFlight.current = true;
      const request = prepareAssistantRequest(
        attempt.current,
        conversationId,
        text,
        Crypto.randomUUID,
      );
      attempt.current = request;
      const own = new AbortController();
      controller.current = own;
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        own.abort();
      }, ASSISTANT_TIMEOUT_MS);
      setPending(text);
      setError(null);
      setAccountRequired(false);
      setDraft('');
      try {
        const result = await sendAssistantMessage({
          ...request,
          signal: own.signal,
        });
        attempt.current = null;
        if (!mounted.current) return;
        if (!conversationId) {
          // Le fil existe maintenant : on l'ouvre depuis la base, qui fait foi.
          router.replace(`/assistant/${result.conversationId}`);
          return;
        }
        await reloadThread();
        void reloadCredits();
        if (mounted.current) setPending(null);
      } catch (failure) {
        if (!mounted.current || (own.signal.aborted && !timedOut)) return;
        const kind =
          timedOut || !(failure instanceof AssistantError)
            ? 'network'
            : failure.kind;
        setDraft((current) => current || text);
        setError(assistantErrorMessage(kind));
        setAccountRequired(kind === 'auth' || kind === 'account');
        setPending(null);
      } finally {
        clearTimeout(timer);
        inFlight.current = false;
      }
    },
    [draft, sending, exhausted, conversationId, reloadThread, reloadCredits],
  );

  useAssistantInitialMessage(
    sendInitialMessage ? draft : '',
    conversationId,
    send,
  );

  const connectionRequired =
    accountRequired ||
    (credits.status === 'error' &&
      (credits.error === 'auth' || credits.error === 'forbidden'));
  const reconnect = async () => {
    if (reconnecting) return;
    setReconnecting(true);
    setAssistantDraft(draft || pending || '', accountRequired);
    try {
      await signOut();
      router.replace('/connexion');
    } catch {
      setError('La reconnexion n’a pas pu démarrer. Réessayez.');
      setReconnecting(false);
    }
  };

  const messages = conversationId && thread.data ? thread.data.messages : EMPTY;
  const loadingThread = Boolean(conversationId) && thread.status === 'loading';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={offset}
      onLayout={(event) => setOffset(event.nativeEvent.layout.y)}
    >
      {conversationId && thread.status === 'error' && thread.data === null ? (
        <ErrorState kind={thread.error ?? 'unknown'} onRetry={thread.retry} />
      ) : loadingThread ? (
        <LoadingState label="Chargement de la conversation…" />
      ) : (
        <FlatList
          ref={list}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Bubble
              role={item.role}
              content={item.content}
              createdAt={item.createdAt}
            />
          )}
          contentContainerStyle={[
            styles.list,
            {
              paddingLeft: insets.left + Spacing.four,
              paddingRight: insets.right + Spacing.four,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onContentSizeChange={() =>
            list.current?.scrollToEnd({ animated: true })
          }
          ListHeaderComponent={
            <View style={styles.footer}>
              {connectionRequired ? (
                <View style={styles.footer}>
                  <ThemedText type="label">
                    Connexion à AAVIE requise
                  </ThemedText>
                  <ThemedText themeColor="textSecondary">
                    Connectez-vous avec votre compte client AAVIE pour retrouver
                    vos crédits et vos conversations.
                  </ThemedText>
                  <PrimaryButton
                    onPress={() => void reconnect()}
                    disabled={reconnecting || sending}
                  >
                    {reconnecting ? 'Reconnexion…' : 'Se reconnecter à AAVIE'}
                  </PrimaryButton>
                </View>
              ) : (
                <CreditsBadge
                  loading={credits.status === 'loading'}
                  credits={credits.data}
                />
              )}
              {thread.status === 'error' && thread.data ? (
                <InlineError kind={thread.error} onRetry={thread.retry} />
              ) : null}
            </View>
          }
          ListEmptyComponent={
            pending ? null : (
              <View style={styles.intro}>
                <ThemedText type="sectionTitle" accessibilityRole="header">
                  Que puis-je faire pour vous ?
                </ThemedText>
                <ThemedText themeColor="textSecondary">
                  Décrivez votre situation avec vos mots. Vous pouvez aussi
                  demander un courrier.
                </ThemedText>
                {SUGGESTIONS.map((suggestion) => (
                  <Pressable
                    key={suggestion}
                    onPress={() => setDraft(suggestion)}
                    accessibilityRole="button"
                    accessibilityLabel={`Suggestion : ${suggestion}`}
                    style={[
                      styles.suggestion,
                      {
                        borderColor: theme.cardBorder,
                        backgroundColor: theme.background,
                      },
                    ]}
                  >
                    <ThemedText type="label">{suggestion}</ThemedText>
                  </Pressable>
                ))}
              </View>
            )
          }
          ListFooterComponent={
            pending ? (
              <View style={styles.footer}>
                <Bubble role="user" content={pending} />
                <View
                  style={styles.typing}
                  accessibilityLiveRegion="polite"
                  accessible
                  accessibilityLabel="L’assistant rédige sa réponse"
                >
                  <ActivityIndicator color={theme.primary} />
                  <ThemedText type="caption" themeColor="textSecondary">
                    L’assistant rédige sa réponse…
                  </ThemedText>
                </View>
              </View>
            ) : null
          }
        />
      )}

      <View
        style={[
          styles.composer,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.cardBorder,
            paddingLeft: insets.left + Spacing.four,
            paddingRight: insets.right + Spacing.four,
            paddingBottom: Math.max(insets.bottom, Spacing.three),
          },
        ]}
      >
        <View style={styles.composerInner}>
          {error ? (
            <ThemedText
              type="caption"
              themeColor="accent"
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
            >
              {error}
            </ThemedText>
          ) : null}
          {exhausted ? (
            <ThemedText
              type="caption"
              themeColor="accent"
              accessibilityRole="alert"
            >
              Vos crédits sont épuisés : vous ne pouvez plus poser de question
              pour le moment.
            </ThemedText>
          ) : null}
          <View style={styles.inputRow}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              maxLength={QUESTION_MAX}
              multiline
              editable={!sending && !exhausted}
              placeholder="Posez votre question…"
              placeholderTextColor={theme.textSecondary}
              accessibilityLabel="Votre question à l’assistant"
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: theme.cardBorder,
                  backgroundColor: theme.backgroundElement,
                },
              ]}
            />
            <DictationButton
              onTranscript={(text) =>
                setDraft((current) => (current ? `${current} ${text}` : text))
              }
              onError={setDictationError}
            />
            <Pressable
              onPress={() => void send()}
              disabled={sending || exhausted || draft.trim().length === 0}
              accessibilityRole="button"
              accessibilityLabel="Envoyer la question"
              accessibilityState={{
                disabled: sending || exhausted || draft.trim().length === 0,
              }}
              style={({ pressed }) => [
                styles.send,
                {
                  backgroundColor: pressed
                    ? theme.primaryPressed
                    : theme.primary,
                  opacity:
                    sending || exhausted || draft.trim().length === 0 ? 0.5 : 1,
                },
              ]}
            >
              <Ionicons name="arrow-up" size={20} color={Palette.white} />
            </Pressable>
          </View>
          {isDictationAvailable ? (
            <ThemedText type="caption" themeColor="textSecondary">
              La dictée peut envoyer votre voix au service de reconnaissance de
              votre téléphone.
            </ThemedText>
          ) : null}
          {dictationError ? (
            <ThemedText type="caption" themeColor="accent">
              {dictationError}
            </ThemedText>
          ) : null}
          <ThemedText type="caption" themeColor="textSecondary">
            L’assistant peut se tromper : vérifiez les informations importantes
            auprès de l’organisme concerné.
          </ThemedText>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const EMPTY: AssistantMessage[] = [];

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
  intro: { gap: Spacing.three, paddingTop: Spacing.three },
  suggestion: {
    minHeight: 48,
    justifyContent: 'center',
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
  },
  bubble: {
    maxWidth: '94%',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 18,
    borderWidth: 1,
  },
  mine: { alignSelf: 'flex-end' },
  theirs: { alignSelf: 'flex-start' },
  who: { fontWeight: '600' },
  footer: { gap: Spacing.three },
  typing: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
  },
  composerInner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.one,
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 140,
    fontSize: 16,
    paddingHorizontal: Spacing.three,
    paddingTop: 12,
    paddingBottom: 12,
    borderWidth: 1,
    borderRadius: 24,
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
