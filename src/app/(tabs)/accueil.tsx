import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DictationButton,
  isDictationAvailable,
} from '@/components/dictation-button';
import { ReminderRow } from '@/components/reminder-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Palette } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useReminders } from '@/context/reminders-context';
import { useTheme } from '@/hooks/use-theme';
import { todayISO } from '@/lib/reminder-date';
import { QUESTION_MAX } from '@/lib/assistant';
import { setAssistantDraft } from '@/lib/assistant-draft';
import { isAssistantEnabled } from '@/constants/assistant';

const shortcuts = [
  { title: 'Planificateur', icon: 'calendar-outline', href: '/planificateur' },
  { title: 'Annuaire', icon: 'business-outline', href: '/annuaire' },
  { title: 'Tous les services', icon: 'grid-outline', href: '/services' },
] as const;

export default function AccueilScreen() {
  const { user } = useAuth();
  const { reminders, isLoaded } = useReminders();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const today = todayISO();
  const upcoming = reminders
    .filter((r) => r.dateISO >= today)
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
    .slice(0, 3);
  const overdue = reminders.filter((r) => r.dateISO < today).length;

  const [question, setQuestion] = useState('');
  const [answered, setAnswered] = useState(false);
  const [dictationError, setDictationError] = useState('');
  const openingAssistant = useRef(false);
  useFocusEffect(
    useCallback(() => {
      openingAssistant.current = false;
    }, []),
  );

  const submitQuestion = () => {
    if (!question.trim() || openingAssistant.current) return;
    Keyboard.dismiss();
    if (!isAssistantEnabled) {
      setAnswered(true);
      return;
    }
    openingAssistant.current = true;
    setAssistantDraft(question.trim());
    router.push('/assistant/nouvelle');
    setQuestion('');
  };

  return (
    <ThemedView type="background" style={styles.screen}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + BottomTabInset + 32,
          paddingLeft: insets.left + 24,
          paddingRight: insets.right + 24,
        }}
      >
        <View style={styles.content}>
          <View style={styles.bar}>
            <View style={styles.brand} accessible accessibilityLabel="AAVIE">
              <Image
                source={require('@/assets/images/aavie-logo-mark.png')}
                contentFit="contain"
                style={styles.logo}
              />
              <ThemedText style={styles.brandName}>AAVIE</ThemedText>
            </View>
            <Pressable
              onPress={() => router.push('/profil')}
              accessibilityRole="button"
              accessibilityLabel="Ouvrir mon compte"
              style={({ pressed }) => [
                styles.avatar,
                {
                  backgroundColor: theme.turquoiseTint,
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
            >
              <ThemedText type="label" themeColor="turquoiseTintText">
                {user?.first_name?.charAt(0).toUpperCase() || 'A'}
              </ThemedText>
            </Pressable>
          </View>
          <View style={styles.greeting}>
            <ThemedText accessibilityRole="header" style={styles.title}>
              Bonjour{user?.first_name ? `, ${user.first_name}` : ''}.
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              Que souhaitez-vous faire aujourd’hui ?
            </ThemedText>
          </View>

          {isLoaded && overdue > 0 ? (
            <Pressable
              onPress={() => router.push('/planificateur')}
              accessibilityRole="button"
              accessibilityLabel={`${overdue} échéance${overdue > 1 ? 's' : ''} à vérifier dans le planificateur`}
              style={({ pressed }) => [
                styles.priority,
                {
                  backgroundColor: theme.coralTint,
                  borderColor: theme.accent,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
            >
              <View style={styles.priorityIcon}>
                <Ionicons name="alert-circle-outline" size={24} color={theme.accent} />
              </View>
              <View style={styles.flex}>
                <ThemedText type="label" themeColor="accent">
                  {overdue} échéance{overdue > 1 ? 's' : ''} à vérifier
                </ThemedText>
                <ThemedText type="caption" themeColor="textSecondary">
                  La date est passée. Ouvrez le planificateur pour la mettre à jour ou la supprimer.
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.accent} />
            </Pressable>
          ) : null}

          <View
            style={[
              styles.assistantCard,
              { backgroundColor: theme.background, borderColor: theme.cardBorder },
            ]}
          >
            <View style={styles.assistantHeading}>
              <View style={[styles.assistantIcon, { backgroundColor: theme.turquoiseTint }]}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={24}
                  color={theme.turquoiseTintText}
                />
              </View>
              <View style={styles.flex}>
                <ThemedText type="sectionTitle">Demandez à l’assistant</ThemedText>
                <ThemedText type="caption" themeColor="textSecondary">
                  Une démarche, un courrier ou une question administrative.
                </ThemedText>
              </View>
            </View>

            <View style={[styles.assistantField, { backgroundColor: theme.backgroundElement }]}>
              <TextInput
                value={question}
                onChangeText={setQuestion}
                maxLength={QUESTION_MAX}
                onSubmitEditing={submitQuestion}
                returnKeyType="send"
                placeholder="Posez votre question…"
                placeholderTextColor={theme.textSecondary}
                accessibilityLabel="Votre question à l’assistant"
                style={[styles.assistantInput, { color: theme.text }]}
              />
              <DictationButton
                onTranscript={(text) =>
                  setQuestion((current) =>
                    current ? `${current} ${text}` : text,
                  )
                }
                onError={setDictationError}
              />
              <Pressable
                onPress={submitQuestion}
                accessibilityRole="button"
                accessibilityLabel="Envoyer la question à l’assistant"
                disabled={!question.trim()}
                style={({ pressed }) => [
                  styles.assistantSend,
                  {
                    backgroundColor: pressed
                      ? theme.primaryPressed
                      : theme.primary,
                  },
                ]}
              >
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={Palette.white}
                />
              </Pressable>
            </View>

            {dictationError !== '' && (
              <ThemedText type="caption" themeColor="accent">
                {dictationError}
              </ThemedText>
            )}

            {isDictationAvailable ? (
              <ThemedText type="caption" themeColor="textSecondary">
                La dictée peut utiliser le service de reconnaissance vocale du téléphone.
              </ThemedText>
            ) : null}

            {answered && !isAssistantEnabled ? (
              <ThemedText type="caption" themeColor="accent">
                L’assistant n’est pas encore disponible. Votre question n’a pas été envoyée.
              </ThemedText>
            ) : null}

            {isAssistantEnabled ? (
              <Pressable
                onPress={() => router.push('/assistant')}
                accessibilityRole="link"
                style={styles.conversationsLink}
              >
                <ThemedText type="label" themeColor="primary">
                  Voir mes conversations
                </ThemedText>
                <Ionicons name="arrow-forward" size={18} color={theme.primary} />
              </Pressable>
            ) : null}
          </View>

          {isLoaded && upcoming.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeading}>
                <ThemedText type="sectionTitle" accessibilityRole="header" style={styles.flex}>
                  Prochaines échéances
                </ThemedText>
                <Pressable
                  onPress={() => router.push('/planificateur')}
                  accessibilityRole="link"
                  style={styles.textLink}
                >
                  <ThemedText type="label" themeColor="primary">Tout voir</ThemedText>
                </Pressable>
              </View>
              {upcoming.map((reminder) => (
                <ReminderRow
                  key={reminder.id}
                  reminder={reminder}
                  onPress={() => router.push('/planificateur')}
                />
              ))}
            </View>
          ) : null}

          <View style={styles.section}>
            <ThemedText type="sectionTitle" accessibilityRole="header">
              Accès rapides
            </ThemedText>
            <View
              style={[styles.shortcuts, fontScale >= 1.5 && styles.stacked]}
            >
              {shortcuts.map((item) => (
                <Pressable
                  key={item.href}
                  onPress={() => router.push(item.href)}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.shortcut,
                    { opacity: pressed ? 0.6 : 1 },
                    fontScale >= 1.5 && styles.shortcutLarge,
                  ]}
                >
                  <View
                    style={[
                      styles.shortcutIcon,
                      { backgroundColor: theme.turquoiseTint },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={24}
                      color={theme.turquoiseTintText}
                    />
                  </View>
                  <ThemedText type="caption" style={styles.shortcutLabel}>
                    {item.title}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
          {!isLoaded ? (
            <ActivityIndicator color={theme.primary} accessibilityLabel="Chargement des échéances" />
          ) : reminders.length === 0 ? (
            <Pressable
              onPress={() => router.push('/planificateur')}
              accessibilityRole="button"
              style={styles.addReminder}
            >
              <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
              <ThemedText type="label" themeColor="primary">Ajouter une première échéance</ThemedText>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: 26 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 32, height: 36 },
  brandName: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: { gap: 8 },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '600',
    letterSpacing: -1.1,
  },
  priority: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 3,
    borderRadius: 16,
    padding: 16,
  },
  priorityIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantCard: {
    gap: 16,
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
  },
  assistantHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  assistantIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingLeft: 14,
    paddingRight: 7,
    minHeight: 52,
  },
  assistantInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  assistantSend: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conversationsLink: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
  },
  section: { gap: 16 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  shortcuts: { flexDirection: 'row', gap: 12 },
  stacked: { flexDirection: 'column' },
  shortcut: { flex: 1, gap: 10, alignItems: 'center', minHeight: 86 },
  shortcutLarge: { flexDirection: 'row', minHeight: 56 },
  shortcutIcon: {
    width: 58,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: { textAlign: 'center', fontWeight: '600', flexShrink: 1 },
  textLink: { minHeight: 48, justifyContent: 'center' },
  addReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    minHeight: 48,
  },
});
