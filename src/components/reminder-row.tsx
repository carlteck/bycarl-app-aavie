import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconChip } from './icon-chip';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { PROCEDURE_CATEGORY_ICON } from '@/constants/procedures';
import type { Reminder } from '@/constants/reminders';
import { CardShadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { daysUntil, formatISODateLong } from '@/lib/reminder-date';

type ReminderRowProps = {
  reminder: Reminder;
  onPress: () => void;
  /** Élément affiché à droite (ex. `<Switch />`) ; par défaut un chevron. */
  trailing?: ReactNode;
};

function relativeLabel(days: number): string {
  if (days < 0) return `En retard de ${Math.abs(days)} j`;
  if (days === 0) return 'Aujourd’hui';
  if (days === 1) return 'Demain';
  return `Dans ${days} j`;
}

export function ReminderRow({ reminder, onPress, trailing }: ReminderRowProps) {
  const theme = useTheme();
  const days = daysUntil(reminder.dateISO);
  const overdue = days < 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${reminder.title}, échéance le ${formatISODateLong(reminder.dateISO)}`}
    >
      {({ pressed }) => (
        <ThemedView
          type="background"
          style={[
            styles.card,
            CardShadow,
            { borderColor: theme.cardBorder, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <IconChip
            name={PROCEDURE_CATEGORY_ICON[reminder.category]}
            variant="primary"
          />
          <View style={styles.body}>
            <ThemedText type="label" numberOfLines={1}>
              {reminder.title}
            </ThemedText>
            <View style={styles.metaRow}>
              <ThemedText themeColor="textSecondary" type="caption">
                {formatISODateLong(reminder.dateISO)}
              </ThemedText>
              <ThemedText
                type="caption"
                style={{
                  color: overdue ? theme.accent : theme.turquoiseTintText,
                }}
              >
                {relativeLabel(days)}
              </ThemedText>
            </View>
          </View>
          {trailing}
        </ThemedView>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
