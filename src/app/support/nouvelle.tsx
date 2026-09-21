import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { StackScreen, useListInsets } from '@/components/stack-screen';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { classifyRemoteError, remoteErrorMessage } from '@/lib/remote-error';
import {
  createTicket,
  MESSAGE_MAX,
  newTicketIds,
  SUBJECT_MAX,
  SUBJECT_MIN,
  TICKET_CATEGORIES,
  type TicketCategory,
} from '@/lib/support';

export default function NewSupportRequestScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const insets = useListInsets();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('autre');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Les mêmes identifiants servent à chaque nouvelle tentative de CET envoi (voir `createTicket`).
  const ids = useRef(newTicketIds());

  const subjectOk = subject.trim().length >= SUBJECT_MIN;
  const bodyOk = body.trim().length > 0;

  const submit = async () => {
    if (sending || !user) return;
    if (!subjectOk || !bodyOk) {
      setError(
        !subjectOk
          ? `Le sujet doit faire au moins ${SUBJECT_MIN} caractères.`
          : 'Décrivez votre problème avant d’envoyer.',
      );
      return;
    }
    setSending(true);
    setError(null);
    try {
      const id = await createTicket(
        user.id,
        { subject, category, body },
        ids.current,
      );
      router.replace(`/support/${id}`);
    } catch (failure) {
      setError(remoteErrorMessage(classifyRemoteError(failure)));
      setSending(false);
    }
  };

  return (
    <StackScreen title="Nouvelle demande" backLabel="Support">
      <ScrollView
        contentContainerStyle={insets}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <TextField
          label="Sujet"
          value={subject}
          onChangeText={setSubject}
          maxLength={SUBJECT_MAX}
          placeholder="Ex : je ne retrouve pas mon échéance"
          returnKeyType="next"
          editable={!sending}
        />

        <View style={styles.field} accessibilityRole="radiogroup">
          <ThemedText type="label">De quoi s’agit-il ?</ThemedText>
          <View style={styles.categories}>
            {TICKET_CATEGORIES.map((item) => {
              const selected = item.value === category;
              return (
                <Pressable
                  key={item.value}
                  onPress={() => setCategory(item.value)}
                  disabled={sending}
                  accessibilityRole="radio"
                  accessibilityState={{ selected, disabled: sending }}
                  style={styles.hit}
                >
                  <ThemedView
                    type={selected ? 'turquoiseTint' : 'background'}
                    style={[
                      styles.chip,
                      {
                        borderColor: selected
                          ? 'transparent'
                          : theme.cardBorder,
                      },
                    ]}
                  >
                    <ThemedText
                      type="label"
                      themeColor={
                        selected ? 'turquoiseTintText' : 'textSecondary'
                      }
                    >
                      {item.label}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <ThemedText type="label">Votre message</ThemedText>
          <TextInput
            value={body}
            onChangeText={setBody}
            maxLength={MESSAGE_MAX}
            multiline
            editable={!sending}
            textAlignVertical="top"
            placeholder="Expliquez simplement ce qui vous empêche d’avancer."
            placeholderTextColor={theme.textSecondary}
            accessibilityLabel="Votre message"
            style={[
              styles.textarea,
              {
                color: theme.text,
                borderColor: theme.cardBorder,
                backgroundColor: theme.background,
              },
            ]}
          />
          <ThemedText type="caption" themeColor="textSecondary">
            {body.length} / {MESSAGE_MAX}
          </ThemedText>
        </View>

        <ThemedText type="caption" themeColor="textSecondary">
          N’indiquez ni mot de passe ni numéro de carte bancaire : l’équipe n’en
          a jamais besoin.
        </ThemedText>

        {error ? (
          <ThemedText
            themeColor="accent"
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
          >
            {error}
          </ThemedText>
        ) : null}

        <PrimaryButton
          icon="paper-plane-outline"
          disabled={sending}
          onPress={() => void submit()}
        >
          {sending ? 'Envoi en cours…' : 'Envoyer ma demande'}
        </PrimaryButton>
      </ScrollView>
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  field: { gap: Spacing.two },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  hit: { minHeight: 48, justifyContent: 'center' },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
    borderWidth: 1,
  },
  textarea: {
    minHeight: 160,
    fontSize: 16,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: 10,
  },
});
