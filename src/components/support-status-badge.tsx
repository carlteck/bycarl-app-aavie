import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

import type { ThemeColor } from '@/constants/theme';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { STATUS_META, type TicketStatus } from '@/lib/support';

const LOOK: Record<
  TicketStatus,
  { icon: keyof typeof Ionicons.glyphMap; bg: ThemeColor; fg: ThemeColor }
> = {
  open: {
    icon: 'mail-open-outline',
    bg: 'turquoiseTint',
    fg: 'turquoiseTintText',
  },
  pending: { icon: 'time-outline', bg: 'coralTint', fg: 'accent' },
  resolved: {
    icon: 'checkmark-circle-outline',
    bg: 'turquoiseTint',
    fg: 'turquoiseTintText',
  },
  closed: {
    icon: 'lock-closed-outline',
    bg: 'backgroundElement',
    fg: 'textSecondary',
  },
};

/** Statut en clair : libellé + icône, jamais la seule couleur (charte §07). */
export function SupportStatusBadge({ status }: { status: TicketStatus }) {
  const theme = useTheme();
  const look = LOOK[status];
  return (
    <View
      style={[styles.badge, { backgroundColor: theme[look.bg] }]}
      accessible
      accessibilityLabel={`Statut : ${STATUS_META[status].label}`}
    >
      <Ionicons name={look.icon} size={14} color={theme[look.fg]} />
      <ThemedText type="caption" themeColor={look.fg} style={styles.label}>
        {STATUS_META[status].label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: 999,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  label: { fontWeight: '600' },
});
