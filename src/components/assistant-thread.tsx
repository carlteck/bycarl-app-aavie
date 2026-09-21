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
import { DictationButton, isDictationAvailable } from './dictation-button';
import { RichText } from './rich-text';
import { ErrorState, LoadingState } from './screen-state';
import { SpeakButton } from './speak-button';
import { ThemedText } from './themed-text';

import { MaxContentWidth, Palette, Spacing } from '@/constants/theme';
import { useAssistantThread, useCredits } from '@/hooks/use-assistant';
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
import { markdownToPlainText } from '@/lib/simple-markdown';

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
          <RichText source={content} />
          <SpeakButton
            text={markdownToPlainText(content)}
            accessibilityLabel="Écouter la réponse de l’assistant"
          />
        </>
      )}
    </View>
  );
});

/**
 * Fil d'une conversation avec l'assistant (existante ou nouvelle si `conversationId` est nul).
 *
 * Le mobile ne fabrique jamais une réponse : il envoie la question à la fonction serveur, puis
 * RELIT l'historique en base. Tant que la réponse n'est pas là, la question s'affiche à part,
 * et en cas d'échec elle revient dans le champ — l'usager ne retape rien.
 */
export function AssistantThread({
  conversationId,
}: {
  conversationId: string | null;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const thread = useAssistantThread(conversationId);
  const credits = useCredits();
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dictationError, setDictationError] = useState('');
  const [offset, setOffset] = useState(0);
  const list = useRef<FlatList<AssistantMessage>>(null);
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  // Même identifiant tant que la MÊME question n'a pas abouti : un renvoi après coupure est
  // dédoublonnable côté serveur.
  const attempt = useRef(Crypto.randomUUID());

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, []);

  const reloadThread = thread.reload;
  const reloadCredits = credits.reload;
  const exhausted = credits.data !== null && credits.data.balance <= 0;
  const sending = pending !== null;

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || sending || exhausted) return;
    const own = new AbortController();
    controller.current = own;
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      own.abort();
    }, ASSISTANT_TIMEOUT_MS);
    setPending(text);
    setError(null);
    setDraft('');
    try {
      const result = await sendAssistantMessage({
        conversationId,
        message: text,
        clientMessageId: attempt.current,
        signal: own.signal,
      });
      attempt.current = Crypto.randomUUID();
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
      setPending(null);
    } finally {
      clearTimeout(timer);
    }
  }, [draft, sending, exhausted, conversationId, reloadThread, reloadCredits]);

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
            <CreditsBadge
              loading={credits.status === 'loading'}
              credits={credits.data}
            />
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
