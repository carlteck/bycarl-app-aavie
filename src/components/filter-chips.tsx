import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Nom du groupe pour les lecteurs d'écran (ex. « Filtrer par statut »). */
  label: string;
};

/**
 * Filtres à choix unique. Turquoise = sélectionné (usage prévu par la charte : « filtres, onglets,
 * repères actifs »), et l'état est aussi porté par `accessibilityState`, jamais par la seule
 * couleur. Défilement horizontal : sur petit téléphone ou en grands caractères, les puces ne
 * doivent pas déborder ni se tronquer.
 */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
}: Props<T>) {
  const theme = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={label}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={styles.hit}
          >
            <ThemedView
              type={selected ? 'turquoiseTint' : 'background'}
              style={[
                styles.chip,
                { borderColor: selected ? 'transparent' : theme.cardBorder },
              ]}
            >
              <ThemedText
                type="label"
                themeColor={selected ? 'turquoiseTintText' : 'textSecondary'}
              >
                {option.label}
              </ThemedText>
            </ThemedView>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: Spacing.two, paddingVertical: Spacing.one },
  hit: { minHeight: 48, justifyContent: 'center' },
  chip: {
    paddingHorizontal: Spacing.three,
    minHeight: 40,
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
  },
});
