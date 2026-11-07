import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { OutlineButton } from '@/components/outline-button';
import { PrimaryButton } from '@/components/primary-button';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/screen-state';
import { StackScreen, useListInsets } from '@/components/stack-screen';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAssistantThread } from '@/hooks/use-assistant';
import { asId } from '@/lib/remote-values';
import { renameConversation } from '@/lib/assistant';

const TITLE_MAX = 190;

export default function RenameAssistantConversationScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const conversationId = asId(params.id);
  const thread = useAssistantThread(conversationId ?? null);
  const insets = useListInsets();
  const [draft, setDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const title = draft ?? thread.data?.conversation?.title ?? '';
  const setTitle = setDraft;

  const cleaned = title.trim();
  const tooLong = cleaned.length > TITLE_MAX;
  const disabled = saving || cleaned.length === 0 || tooLong;

  const save = async () => {
    if (!conversationId || disabled) return;
    setSaving(true);
    setSaveError(null);
    try {
      await renameConversation(conversationId, cleaned);
      router.back();
    } catch {
      setSaveError('Le titre n’a pas été enregistré. Réessayez.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <StackScreen title="Renommer" backLabel="Assistant">
      <View style={insets}>
        {!conversationId ? (
          <EmptyState
            icon="alert-circle-outline"
            title="Conversation introuvable"
            message="Ce lien ne correspond à aucune conversation."
          />
        ) : thread.status === 'loading' ? (
          <LoadingState label="Chargement de la conversation…" />
        ) : thread.status === 'error' && thread.data === null ? (
          <ErrorState kind={thread.error ?? 'unknown'} onRetry={thread.retry} />
        ) : thread.data?.conversation ? (
          <View style={styles.content}>
            <ThemedText themeColor="textSecondary">
              Donnez un titre clair pour retrouver cette conversation plus vite.
            </ThemedText>
            <TextField
              label="Titre"
              value={title}
              onChangeText={(value) => {
                setTitle(value);
                if (saveError) setSaveError(null);
              }}
              maxLength={TITLE_MAX + 10}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => {
                if (!disabled) void save();
              }}
            />
            <ThemedText
              type="caption"
              themeColor={tooLong ? 'accent' : 'textSecondary'}
            >
              {cleaned.length}/{TITLE_MAX}
            </ThemedText>
            {saveError ? (
              <ThemedView type="backgroundElement" style={styles.errorBox}>
                <ThemedText type="caption" themeColor="accent">
                  {saveError}
                </ThemedText>
              </ThemedView>
            ) : null}
            <PrimaryButton onPress={() => void save()} disabled={disabled}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </PrimaryButton>
            <OutlineButton onPress={() => router.back()}>Annuler</OutlineButton>
          </View>
        ) : (
          <EmptyState
            icon="chatbubbles-outline"
            title="Conversation absente"
            message="Cette conversation n’existe plus."
          />
        )}
      </View>
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
  },
  errorBox: {
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
