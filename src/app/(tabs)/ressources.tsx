import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { FilterChips } from '@/components/filter-chips';
import { IconChip } from '@/components/icon-chip';
import { PageHeader } from '@/components/page-header';
import { SearchField } from '@/components/search-field';
import {
  EmptyState,
  ErrorState,
  InlineError,
  LoadingState,
} from '@/components/screen-state';
import { useTabListInsets } from '@/components/stack-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CardShadow, Spacing } from '@/constants/theme';
import { useResourceCategories, useResources } from '@/hooks/use-catalogs';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useTheme } from '@/hooks/use-theme';
import type { Resource } from '@/lib/resources';

const ALL = '__all__';

function ResourceCard({ item }: { item: Resource }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => router.push(`/ressource/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. ${item.category}.${item.durationLabel ? ` ${item.durationLabel}.` : ''}`}
      accessibilityHint="Ouvre la ressource"
      style={({ pressed }) => [
        styles.card,
        CardShadow,
        {
          backgroundColor: theme.background,
          borderColor: theme.cardBorder,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <IconChip name="book-outline" size={40} />
      <View style={styles.cardBody}>
        <ThemedText type="label">{item.title}</ThemedText>
        {item.description ? (
          <ThemedText
            type="caption"
            themeColor="textSecondary"
            numberOfLines={2}
          >
            {item.description}
          </ThemedText>
        ) : null}
        <View style={styles.meta}>
          <ThemedView type="turquoiseTint" style={styles.tag}>
            <ThemedText type="caption" themeColor="turquoiseTintText">
              {item.category}
            </ThemedText>
          </ThemedView>
          {item.durationLabel ? (
            <ThemedText type="caption" themeColor="textSecondary">
              {item.durationLabel}
            </ThemedText>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export default function RessourcesScreen() {
  const theme = useTheme();
  const insets = useTabListInsets();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL);
  const term = useDebouncedValue(query);
  const list = useResources(category === ALL ? null : category, term);
  const categories = useResourceCategories();

  const options = useMemo(
    () => [
      { value: ALL, label: 'Toutes' },
      ...(categories.data ?? []).map((name) => ({ value: name, label: name })),
    ],
    [categories.data],
  );
  const filtered = category !== ALL || term.trim().length >= 2;

  return (
    <ThemedView type="background" style={styles.screen}>
      <PageHeader
        icon="book-outline"
        title="Des repères clairs."
        intro="Pour mieux comprendre, puis avancer."
      />
      <FlatList
        style={{ backgroundColor: theme.background }}
        data={list.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ResourceCard item={item} />}
        contentContainerStyle={insets}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={list.refreshing}
            onRefresh={() => {
              list.refresh();
              categories.reload();
            }}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher un guide"
              label="Rechercher dans le centre de ressources"
            />
            {options.length > 1 ? (
              <FilterChips
                options={options}
                value={category}
                onChange={setCategory}
                label="Filtrer par catégorie"
              />
            ) : null}
            {list.status === 'ready' && list.error ? (
              <InlineError kind={list.error} onRetry={list.refresh} />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          list.status === 'loading' ? (
            <LoadingState label="Chargement des ressources…" />
          ) : list.status === 'error' && list.error ? (
            <ErrorState kind={list.error} onRetry={list.retry} />
          ) : filtered ? (
            <EmptyState
              icon="search-outline"
              title="Aucune ressource trouvée"
              message="Essayez d’autres mots ou une autre catégorie."
            />
          ) : (
            <EmptyState
              icon="book-outline"
              title="Aucune ressource publiée"
              message="Les guides et explications pour vos démarches seront proposés ici."
            />
          )
        }
        ListFooterComponent={
          list.loadingMore ? (
            <ActivityIndicator accessibilityLabel="Chargement de la suite" />
          ) : null
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { gap: Spacing.three },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    padding: Spacing.three,
    minHeight: 80,
    borderRadius: 18,
    borderWidth: 1,
  },
  cardBody: { flex: 1, gap: Spacing.one },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tag: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 999,
  },
});
