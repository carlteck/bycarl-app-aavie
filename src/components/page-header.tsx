import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';

type PageHeaderProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  intro?: string;
  brand?: boolean;
};
export function PageHeader({ icon, title, intro }: PageHeaderProps) {
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
        <View style={styles.identity}>
          <Ionicons name={icon} size={18} color={theme.turquoiseTintText} />
          <ThemedText
            type="caption"
            themeColor="turquoiseTintText"
            style={styles.eyebrow}
          >
            VOTRE QUOTIDIEN AVEC AAVIE
          </ThemedText>
        </View>
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
  identity: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyebrow: { flexShrink: 1, letterSpacing: 1, fontWeight: '600' },
  title: { fontSize: 32, lineHeight: 38, letterSpacing: -1, fontWeight: '600' },
});
