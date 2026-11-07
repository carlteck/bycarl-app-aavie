import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/context/locale-context';

type PageHeaderProps = {
  icon?: string;
  title: string;
  intro?: string;
  brand?: boolean;
  onBack?: () => void;
  backLabel?: string;
};
export function PageHeader({ title, intro, onBack, backLabel = 'Services' }: PageHeaderProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { translateText } = useLocale();
  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top + 16,
          paddingLeft: insets.left + 24,
          paddingRight: insets.right + 24,
        },
      ]}
    >
      <View style={styles.content}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={translateText(backLabel)}
            style={styles.back}
          >
            <Ionicons name="chevron-back" size={22} color={theme.primary} />
            <ThemedText type="label" themeColor="primary">{backLabel}</ThemedText>
          </Pressable>
        ) : null}
        <ThemedText accessibilityRole="header" style={styles.title}>
          {title}
        </ThemedText>
        {intro && <ThemedText themeColor="textSecondary">{intro}</ThemedText>}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { paddingBottom: 24 },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: 12 },
  back: { minHeight: 48, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 32, lineHeight: 38, letterSpacing: -1, fontWeight: '600' },
});
