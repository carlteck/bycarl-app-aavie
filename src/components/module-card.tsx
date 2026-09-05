import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconChip } from './icon-chip';
import { ThemedText } from './themed-text';
import type { AavieModule } from '@/constants/modules';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ModuleCardProps = AavieModule & { variant?: 'feature' | 'compact' };
export function ModuleCard({
  title,
  description,
  icon,
  href,
  variant = 'feature',
  comingSoon,
}: ModuleCardProps) {
  const theme = useTheme();
  const compact = variant === 'compact';
  const content = (
    <>
      <IconChip name={icon} variant="turquoise" size={40} />
      <View style={styles.body}>
        <ThemedText type="label">{title}</ThemedText>
        {!compact && (
          <ThemedText
            type="caption"
            themeColor="textSecondary"
            style={{ lineHeight: 20 }}
          >
            {description}
          </ThemedText>
        )}
        {(!href || comingSoon) && (
          <ThemedText type="caption" themeColor="textSecondary">
            Bientôt disponible
          </ThemedText>
        )}
      </View>
      {href && !compact && (
        <Ionicons name="chevron-forward" size={18} color={theme.primary} />
      )}
    </>
  );
  const cardStyle = [
    styles.card,
    compact && styles.compact,
    { backgroundColor: theme.pageBackground, borderColor: theme.cardBorder },
  ];
  return href ? (
    <Pressable
      onPress={() => router.push(href as never)}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.7 : 1 }]}
    >
      {content}
    </Pressable>
  ) : (
    <View
      accessible
      accessibilityLabel={`${title}. ${description} Bientôt disponible.`}
      style={cardStyle}
    >
      {content}
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    gap: Spacing.three,
    borderWidth: 0,
    borderRadius: 20,
    minHeight: 80,
  },
  compact: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  body: { flex: 1, gap: Spacing.one },
});
