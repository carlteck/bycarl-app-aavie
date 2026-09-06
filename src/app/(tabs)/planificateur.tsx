import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
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
import { todayISO } from '@/lib/reminder-date';
import type { Reminder } from '@/constants/reminders';

type FormState = 'hidden' | 'new' | string;
type Filter = 'upcoming' | 'overdue' | 'all';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'upcoming', label: 'À venir' },
  { key: 'overdue', label: 'En retard' },
  { key: 'all', label: 'Toutes' },
];

function ReminderSection({
  title,
  reminders,
  onEdit,
}: {
  title: string;
  reminders: Reminder[];
  onEdit: (id: string) => void;
}) {
  if (reminders.length === 0) return null;
  return (
    <View style={styles.reminderSection}>
      <View style={styles.listHeading}>
        <ThemedText type="sectionTitle">{title}</ThemedText>
        <ThemedText type="caption" themeColor="textSecondary">
          {reminders.length}
        </ThemedText>
      </View>
      {reminders.map((reminder) => (
        <ReminderRow
          key={reminder.id}
          reminder={reminder}
          onPress={() => onEdit(reminder.id)}
        />
      ))}
    </View>
  );
}

export default function PlanificateurScreen() {
  const { reminders, isLoaded, addReminder, updateReminder, removeReminder } =
    useReminders();
  const [formState, setFormState] = useState<FormState>('hidden');
  const [filter, setFilter] = useState<Filter>('upcoming');
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

  const today = todayISO();
  const { upcoming, overdue } = useMemo(() => {
    const future = reminders
      .filter((reminder) => reminder.dateISO >= today)
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    const late = reminders
      .filter((reminder) => reminder.dateISO < today)
      .sort((a, b) => b.dateISO.localeCompare(a.dateISO));
    return { upcoming: future, overdue: late };
  }, [reminders, today]);
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

  const confirmDelete = () => {
    if (!editing) return;
    const remove = () => {
      removeReminder(editing.id);
      setFormState('hidden');
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`Supprimer « ${editing.title} » ?`)) remove();
      return;
    }
    Alert.alert(
      'Supprimer cette échéance ?',
      `« ${editing.title} » sera retirée de votre planificateur.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: remove },
      ],
    );
  };

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
          {formState === 'hidden' ? (
            <>
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
                  {upcoming.length === 0
                    ? 'Votre agenda est libre.'
                    : `${upcoming.length} échéance${upcoming.length > 1 ? 's' : ''} à venir.`}
                </ThemedText>
                <ThemedText themeColor="textSecondary">
                  {overdue.length > 0
                    ? `${overdue.length} échéance${overdue.length > 1 ? 's sont' : ' est'} à vérifier.`
                    : 'Tout est à jour pour le moment.'}
                </ThemedText>
                <View style={styles.metrics}>
                  <View
                    style={[
                      styles.metric,
                      { backgroundColor: theme.background },
                    ]}
                  >
                    <ThemedText style={styles.metricValue} themeColor="primary">
                      {upcoming.length}
                    </ThemedText>
                    <ThemedText type="caption" themeColor="textSecondary">
                      À venir
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.metric,
                      { backgroundColor: theme.background },
                    ]}
                  >
                    <ThemedText
                      style={styles.metricValue}
                      themeColor={overdue.length > 0 ? 'accent' : 'text'}
                    >
                      {overdue.length}
                    </ThemedText>
                    <ThemedText type="caption" themeColor="textSecondary">
                      En retard
                    </ThemedText>
                  </View>
                </View>
              </View>
              <PrimaryButton onPress={() => setFormState('new')} icon="add">
                Ajouter une échéance
              </PrimaryButton>

              {!isLoaded ? (
                <View style={styles.loading}>
                  <ActivityIndicator color={theme.primary} />
                  <ThemedText themeColor="textSecondary">
                    Chargement de vos échéances…
                  </ThemedText>
                </View>
              ) : reminders.length === 0 ? (
                <View
                  style={[
                    styles.emptyState,
                    { backgroundColor: theme.backgroundElement },
                  ]}
                >
                  <View
                    style={[
                      styles.emptyIcon,
                      { backgroundColor: theme.turquoiseTint },
                    ]}
                  >
                    <Ionicons
                      name="calendar-clear-outline"
                      size={30}
                      color={theme.turquoiseTintText}
                    />
                  </View>
                  <ThemedText type="sectionTitle">
                    La suite est à vous.
                  </ThemedText>
                  <ThemedText
                    themeColor="textSecondary"
                    style={styles.centerText}
                  >
                    Ajoutez un rendez-vous, une date limite ou une démarche à ne
                    pas oublier.
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.listArea}>
                  <View style={styles.filters}>
                    {FILTERS.map((item) => {
                      const selected = filter === item.key;
                      const count =
                        item.key === 'upcoming'
                          ? upcoming.length
                          : item.key === 'overdue'
                            ? overdue.length
                            : reminders.length;
                      return (
                        <Pressable
                          key={item.key}
                          onPress={() => setFilter(item.key)}
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          style={({ pressed }) => [
                            styles.filter,
                            {
                              backgroundColor: selected
                                ? theme.turquoiseTint
                                : theme.backgroundElement,
                              opacity: pressed ? 0.7 : 1,
                            },
                          ]}
                        >
                          <ThemedText
                            type="label"
                            themeColor={
                              selected ? 'turquoiseTintText' : 'textSecondary'
                            }
                          >
                            {item.label} · {count}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>
                  {(filter === 'upcoming' || filter === 'all') && (
                    <ReminderSection
                      title="À venir"
                      reminders={upcoming}
                      onEdit={setFormState}
                    />
                  )}
                  {(filter === 'overdue' || filter === 'all') && (
                    <ReminderSection
                      title="En retard"
                      reminders={overdue}
                      onEdit={setFormState}
                    />
                  )}
                  {((filter === 'upcoming' && upcoming.length === 0) ||
                    (filter === 'overdue' && overdue.length === 0)) && (
                    <ThemedText
                      themeColor="textSecondary"
                      style={styles.filteredEmpty}
                    >
                      {filter === 'overdue'
                        ? 'Aucune échéance en retard.'
                        : 'Aucune échéance à venir.'}
                    </ThemedText>
                  )}
                </View>
              )}
            </>
          ) : (
            <View style={styles.formArea}>
              <View style={styles.formHeading}>
                <ThemedText type="sectionTitle">
                  {editing ? 'Modifier l’échéance' : 'Nouvelle échéance'}
                </ThemedText>
                <ThemedText type="caption" themeColor="textSecondary">
                  {editing
                    ? 'Mettez à jour les informations utiles.'
                    : 'Ajoutez la date et choisissez quand être prévenu.'}
                </ThemedText>
              </View>
              <ReminderForm
                initialValue={editing}
                onCancel={() => setFormState('hidden')}
                onSubmit={(input) => {
                  if (editing) updateReminder(editing.id, input);
                  else addReminder(input);
                  setFormState('hidden');
                }}
                onDelete={editing ? confirmDelete : undefined}
              />
            </View>
          )}
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
  metrics: { flexDirection: 'row', gap: Spacing.two, paddingTop: Spacing.one },
  metric: {
    flex: 1,
    minHeight: 76,
    borderRadius: 18,
    padding: Spacing.three,
    justifyContent: 'center',
  },
  metricValue: { fontSize: 24, lineHeight: 28, fontWeight: '600' },
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
    maxWidth: 720,
    gap: Spacing.four,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    minHeight: 160,
  },
  emptyState: {
    minHeight: 220,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  centerText: { textAlign: 'center', maxWidth: 420 },
  listArea: { gap: Spacing.four },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  filter: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
  },
  reminderSection: { gap: 0 },
  listHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.two,
  },
  filteredEmpty: {
    textAlign: 'center',
    paddingVertical: Spacing.five,
  },
  formArea: { gap: Spacing.three },
  formHeading: { gap: Spacing.one },
});
