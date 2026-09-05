import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnnuaireEntryCard } from '@/components/annuaire-entry-card';
import { GradientHeader } from '@/components/gradient-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  ANNUAIRE_CATEGORIES,
  ANNUAIRE_ENTRIES,
  type AnnuaireCategory,
} from '@/constants/annuaire';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CategoryFilter = AnnuaireCategory | 'Tous';

export default function AnnuaireScreen() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('Tous');
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return ANNUAIRE_ENTRIES.filter((entry) => {
      const matchesCategory =
        category === 'Tous' || entry.category === category;
      const matchesQuery =
        normalized.length === 0 ||
        [entry.name, entry.category, entry.description].some((field) =>
          field.toLowerCase().includes(normalized),
        );
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  const contentPlatformStyle = Platform.select({
    android: {
      paddingLeft: Spacing.four + safeAreaInsets.left,
      paddingRight: Spacing.four + safeAreaInsets.right,
      paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
    },
    web: {
      paddingTop: Spacing.four,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ThemedView style={styles.screen}>
      <GradientHeader
        icon="business-outline"
        title="Annuaire administratif"
        intro="Retrouvez rapidement les coordonnées des services administratifs près de chez vous."
      />
      <FlatList
        style={[styles.list, { backgroundColor: theme.background }]}
        contentInset={{
          bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
        }}
        contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThemedView style={styles.cardWrapper}>
            <AnnuaireEntryCard {...item} />
          </ThemedView>
        )}
        ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
        ListHeaderComponent={
          <ThemedView style={styles.header}>
            <View
              style={[
                styles.searchBar,
                { backgroundColor: theme.backgroundElement },
              ]}
            >
              <Ionicons
                name="search-outline"
                size={17}
                color={theme.textSecondary}
              />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Rechercher un organisme (ex : CAF, impôts, préfecture)"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                accessibilityLabel="Rechercher un organisme"
                style={[styles.searchInput, { color: theme.text }]}
              />
            </View>

            <View style={styles.chipRow}>
              {(['Tous', ...ANNUAIRE_CATEGORIES] as CategoryFilter[]).map(
                (item) => {
                  const selected = item === category;
                  return (
                    <Pressable
                      key={item}
                      onPress={() => setCategory(item)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                    >
                      <ThemedView
                        type={selected ? 'turquoise' : 'background'}
                        style={[
                          styles.filterChip,
                          {
                            borderColor: selected
                              ? 'transparent'
                              : theme.cardBorder,
                          },
                        ]}
                      >
                        <ThemedText
                          type="label"
                          style={{
                            color: selected
                              ? theme.turquoiseTintText
                              : theme.textSecondary,
                          }}
                        >
                          {item}
                        </ThemedText>
                      </ThemedView>
                    </Pressable>
                  );
                },
              )}
            </View>
          </ThemedView>
        }
        ListEmptyComponent={
          <ThemedText
            themeColor="textSecondary"
            style={[styles.centerText, styles.emptyState]}
          >
            Aucun organisme ne correspond à votre recherche.
          </ThemedText>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
  },
  header: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
  centerText: {
    textAlign: 'center',
  },
  searchBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.two,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  filterChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
    borderWidth: 1,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  separator: {
    height: Spacing.three,
  },
  emptyState: {
    paddingTop: Spacing.four,
  },
});
