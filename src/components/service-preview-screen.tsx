import type { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconChip } from '@/components/icon-chip';
import { ScreenHeaderBar } from '@/components/screen-header-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CardShadow, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IconName = keyof typeof Ionicons.glyphMap;

export type PreviewItem = {
  icon: IconName;
  title: string;
  description: string;
};

type Props = {
  title: string;
  icon: IconName;
  eyebrow: string;
  headline: string;
  description: string;
  items: PreviewItem[];
  footer: string;
};

export function ServicePreviewScreen({
  title,
  icon,
  eyebrow,
  headline,
  description,
  items,
  footer,
}: Props) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <ThemedView type="pageBackground" style={styles.screen}>
      <ScreenHeaderBar
        title={title}
        onBack={() => router.back()}
        backLabel="Services"
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingLeft: insets.left + Spacing.four,
          paddingRight: insets.right + Spacing.four,
          paddingBottom: insets.bottom + Spacing.five,
        }}
      >
        <View style={styles.content}>
          <View style={[styles.hero, { backgroundColor: theme.turquoiseTint }]}>
            <View style={styles.heroTop}>
              <IconChip name={icon} size={52} />
              <ThemedText
                type="caption"
                themeColor="turquoiseTintText"
                style={styles.eyebrow}
              >
                {eyebrow}
              </ThemedText>
            </View>
            <ThemedText accessibilityRole="header" style={styles.headline}>
              {headline}
            </ThemedText>
            <ThemedText themeColor="textSecondary">{description}</ThemedText>
          </View>

          <View style={styles.sectionHeading}>
            <ThemedText type="sectionTitle" accessibilityRole="header">
              Ce que vous pourrez faire
            </ThemedText>
            <View style={[styles.badge, { backgroundColor: theme.coralTint }]}>
              <ThemedText type="caption" themeColor="accent">
                En préparation
              </ThemedText>
            </View>
          </View>

          <View style={styles.cards}>
            {items.map((item) => (
              <View
                key={item.title}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.cardBorder,
                  },
                  CardShadow,
                ]}
              >
                <IconChip name={item.icon} />
                <View style={styles.cardText}>
                  <ThemedText type="label">{item.title}</ThemedText>
                  <ThemedText type="caption" themeColor="textSecondary">
                    {item.description}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>

          <View
            style={[
              styles.notice,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            <IconChip name="information-circle-outline" size={36} />
            <ThemedText
              type="caption"
              themeColor="textSecondary"
              style={styles.noticeText}
            >
              {footer}
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.four,
    paddingTop: Spacing.four,
  },
  hero: { borderRadius: 28, padding: Spacing.four, gap: Spacing.three },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  eyebrow: { flex: 1, fontWeight: '600', letterSpacing: 1.1 },
  headline: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600',
    letterSpacing: -0.8,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  cards: { gap: Spacing.three },
  card: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.three,
  },
  cardText: { flex: 1, gap: Spacing.one },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: 20,
    padding: Spacing.three,
  },
  noticeText: { flex: 1 },
});
