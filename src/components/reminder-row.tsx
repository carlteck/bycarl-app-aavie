import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import type { Reminder } from '@/constants/reminders';
import { useTheme } from '@/hooks/use-theme';
import { daysUntil, formatISODateLong } from '@/lib/reminder-date';

type ReminderRowProps = {
  reminder: Reminder;
  onPress: () => void;
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
  const [day, month, year] = formatISODateLong(reminder.dateISO).split(' ');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${reminder.title}, échéance le ${formatISODateLong(reminder.dateISO)}, ${relativeLabel(days)}`}
      style={({ pressed }) => [
        styles.row,
        { borderColor: theme.cardBorder, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <View style={[styles.date, { backgroundColor: theme.turquoiseTint }]}>
        <ThemedText style={styles.day} themeColor="turquoiseTintText">
          {day}
        </ThemedText>
        <ThemedText type="caption" themeColor="turquoiseTintText">
          {month}
        </ThemedText>
      </View>
      <View style={styles.body}>
        <ThemedText type="label">{reminder.title}</ThemedText>
        <ThemedText type="caption" themeColor="textSecondary">
          {reminder.category} · {year}
        </ThemedText>
        <ThemedText
          type="caption"
          themeColor={days < 0 ? 'accent' : 'turquoiseTintText'}
        >
          {relativeLabel(days)}
        </ThemedText>
      </View>
      {trailing ?? (
        <Ionicons
          name="chevron-forward"
          size={17}
          color={theme.textSecondary}
        />
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    minHeight: 88,
  },
  date: {
    minWidth: 54,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  day: { fontSize: 24, lineHeight: 28, fontWeight: '600', letterSpacing: -0.5 },
  body: { flex: 1, gap: 5 },
});
