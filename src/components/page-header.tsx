import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';

type PageHeaderProps = {
  icon?: string;
  title: string;
  intro?: string;
  brand?: boolean;
};
export function PageHeader({ title, intro }: PageHeaderProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
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
  title: { fontSize: 32, lineHeight: 38, letterSpacing: -1, fontWeight: '600' },
});
