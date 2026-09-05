import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { ReminderForm } from '@/components/reminder-form';
import { ReminderRow } from '@/components/reminder-row';
import { ScreenHeaderBar } from '@/components/screen-header-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useReminders } from '@/context/reminders-context';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { daysUntil } from '@/lib/reminder-date';

type FormState = 'hidden' | 'new' | string;

export default function NotificationsScreen() {
  const { reminders, addReminder, updateReminder, removeReminder } =
    useReminders();
  const [formState, setFormState] = useState<FormState>('hidden');
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

  const sorted = [...reminders].sort((a, b) =>
    a.dateISO.localeCompare(b.dateISO),
  );
  const active = sorted.filter(
    (reminder) =>
      reminder.notifyEnabled &&
      daysUntil(reminder.dateISO) <= reminder.leadDays,
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
      <ScreenHeaderBar
        title="Notifications et rappels"
        onBack={() => router.back()}
        backLabel="Accueil"
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

          {active.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="sectionTitle">Alertes actives</ThemedText>
              <ThemedText themeColor="textSecondary">
                Ces échéances sont entrées dans leur délai de rappel.
              </ThemedText>
              <View style={styles.list}>
                {active.map((reminder) => (
                  <ReminderRow
                    key={reminder.id}
                    reminder={reminder}
                    onPress={() => setFormState(reminder.id)}
                  />
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <ThemedText type="sectionTitle">Tous les rappels</ThemedText>
            {sorted.length === 0 ? (
              <ThemedText themeColor="textSecondary" style={styles.emptyState}>
                Aucune échéance enregistrée pour l’instant.
              </ThemedText>
            ) : (
              <View style={styles.list}>
                {sorted.map((reminder) => (
                  <ReminderRow
                    key={reminder.id}
                    reminder={reminder}
                    onPress={() => setFormState(reminder.id)}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
  section: {
    gap: Spacing.three,
  },
  list: {
    gap: Spacing.three,
  },
  emptyState: {
    textAlign: 'center',
    paddingTop: Spacing.two,
  },
});
