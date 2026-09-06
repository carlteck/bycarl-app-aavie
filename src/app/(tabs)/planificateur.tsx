import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { PageHeader } from '@/components/page-header';
import { ReminderForm } from '@/components/reminder-form';
import { ReminderRow } from '@/components/reminder-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useReminders } from '@/context/reminders-context';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FormState = 'hidden' | 'new' | string;

export default function PlanificateurScreen() {
  const { reminders, addReminder, updateReminder, removeReminder } =
    useReminders();
  const [formState, setFormState] = useState<FormState>('hidden');
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

  const sorted = [...reminders].sort((a, b) =>
    a.dateISO.localeCompare(b.dateISO),
  );
  const editing =
    formState !== 'hidden' && formState !== 'new'
      ? reminders.find((r) => r.id === formState)
      : undefined;

  const contentPlatformStyle = Platform.select({
    android: {
      paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
    },
    web: { paddingTop: Spacing.four, paddingBottom: Spacing.four },
  });

  return (
    <ThemedView type="background" style={styles.screen}>
      <PageHeader
        icon="calendar-outline"
        title="Planificateur"
        intro="Vos rendez-vous et vos dates importantes au même endroit."
      />
      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.background }]}
        contentInset={{
          bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
        }}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingLeft: Spacing.four + safeAreaInsets.left,
            paddingRight: Spacing.four + safeAreaInsets.right,
          },
          contentPlatformStyle,
        ]}
      >
        <View style={styles.content}>
          {formState === 'hidden' && (
            <View
              style={[
                styles.overview,
                { backgroundColor: theme.turquoiseTint },
              ]}
            >
              <View style={styles.overviewHeading}>
                <ThemedText
                  type="caption"
                  themeColor="turquoiseTintText"
                  style={{ letterSpacing: 1.2 }}
                >
                  CHAQUE DATE COMPTE
                </ThemedText>
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color={theme.turquoiseTintText}
                />
              </View>
              <ThemedText style={styles.overviewTitle}>
                L’esprit libre, les dates en tête.
              </ThemedText>
              <ThemedText themeColor="textSecondary">
                Retrouvez vos rendez-vous et les démarches à ne pas oublier.
              </ThemedText>
            </View>
          )}
          {formState === 'new' || editing ? (
            <ReminderForm
              initialValue={editing}
              onCancel={() => setFormState('hidden')}
              onSubmit={(input) => {
                if (editing) updateReminder(editing.id, input);
                else addReminder(input);
                setFormState('hidden');
              }}
              onDelete={
                editing
                  ? () => {
                      removeReminder(editing.id);
                      setFormState('hidden');
                    }
                  : undefined
              }
            />
          ) : (
            <PrimaryButton onPress={() => setFormState('new')} icon="add">
              Ajouter une échéance
            </PrimaryButton>
          )}

          <View style={styles.list}>
            {sorted.length === 0 ? (
              <ThemedText themeColor="textSecondary" style={styles.emptyState}>
                Votre agenda commence ici. Ajoutez une première date à retenir.
              </ThemedText>
            ) : (
              sorted.map((reminder) => (
                <ReminderRow
                  key={reminder.id}
                  reminder={reminder}
                  onPress={() => setFormState(reminder.id)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  overview: { padding: 24, borderRadius: 26, gap: 14 },
  overviewHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  overviewTitle: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.8,
    fontWeight: '600',
  },
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: 560,
    gap: Spacing.four,
  },
  list: {
    gap: 0,
  },
  emptyState: {
    textAlign: 'center',
    paddingTop: Spacing.four,
  },
});
