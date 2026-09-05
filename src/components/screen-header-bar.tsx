import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenHeaderBarProps = {
  title: string;
  onBack: () => void;
  backLabel?: string;
};

/**
 * Barre de navigation légère pour les écrans empilés (Stack) au-dessus des onglets natifs, qui
 * n'ont pas d'en-tête natif par défaut (voir `demarche/_layout.tsx`, `profil/_layout.tsx`).
 * Bouton retour large (zone tactile ≥44pt) et libellé explicite pour les lecteurs d'écran.
 */
export function ScreenHeaderBar({
  title,
  onBack,
  backLabel = 'Retour',
}: ScreenHeaderBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView
      style={[
        styles.bar,
        {
          paddingTop: insets.top + Spacing.two,
          borderBottomColor: theme.cardBorder,
        },
      ]}
    >
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={22} color={theme.primary} />
        <ThemedText type="label" themeColor="primary">
          {backLabel}
        </ThemedText>
      </Pressable>
      <View style={styles.titleRow}>
        <ThemedText type="sectionTitle" numberOfLines={1}>
          {title}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    gap: Spacing.one,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    alignSelf: 'flex-start',
  },
  titleRow: {
    paddingBottom: Spacing.one,
  },
});
