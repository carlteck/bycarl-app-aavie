import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { StackScreen, useListInsets } from '@/components/stack-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LOCALES } from '@/constants/locales';
import { Spacing } from '@/constants/theme';
import { useLocale } from '@/context/locale-context';
import { useTheme } from '@/hooks/use-theme';

export default function LanguageScreen() {
  const theme = useTheme();
  const insets = useListInsets();
  const { locale, setLocale } = useLocale();

  return (
    <StackScreen title="Langue de l’application" backLabel="Compte">
      <ScrollView contentContainerStyle={insets}>
        <View style={styles.intro}>
          <ThemedText type="sectionTitle">Choisissez votre langue</ThemedText>
          <ThemedText themeColor="textSecondary">
            La navigation et les fonctions de l’application sont mises à jour immédiatement.
          </ThemedText>
        </View>
        <ThemedView
          type="background"
          style={[styles.list, { borderColor: theme.cardBorder }]}
          accessibilityRole="radiogroup"
        >
          {LOCALES.map((entry, index) => {
            const selected = entry.code === locale;
            return (
              <Pressable
                key={entry.code}
                onPress={() => void setLocale(entry.code)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={entry.label}
                style={({ pressed }) => [
                  styles.row,
                  index > 0 && { borderTopColor: theme.cardBorder, borderTopWidth: StyleSheet.hairlineWidth },
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText style={styles.flag} accessibilityElementsHidden>
                  {entry.flag}
                </ThemedText>
                <ThemedText type="label" style={styles.label}>
                  {entry.label}
                </ThemedText>
                <View
                  style={[
                    styles.radio,
                    { borderColor: selected ? theme.primary : theme.cardBorder },
                    selected && { backgroundColor: theme.primary },
                  ]}
                >
                  {selected ? <Ionicons name="checkmark" size={15} color="#FFFFFF" /> : null}
                </View>
              </Pressable>
            );
          })}
        </ThemedView>
        <ThemedText type="caption" themeColor="textSecondary">
          Les documents juridiques et certains contenus publiés peuvent rester dans leur langue d’origine.
        </ThemedText>
      </ScrollView>
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: Spacing.two },
  list: { borderWidth: 1, borderRadius: 20, overflow: 'hidden' },
  row: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  flag: { fontSize: 24, lineHeight: 30 },
  label: { flex: 1 },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.65 },
});
