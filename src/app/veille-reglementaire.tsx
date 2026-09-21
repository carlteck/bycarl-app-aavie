import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { FilterChips } from '@/components/filter-chips';
import { SearchField } from '@/components/search-field';
import {
  EmptyState,
  ErrorState,
  InlineError,
  LoadingState,
} from '@/components/screen-state';
import { StackScreen, useListInsets } from '@/components/stack-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CardShadow, Spacing } from '@/constants/theme';
import { useRegulatoryNews } from '@/hooks/use-catalogs';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useTheme } from '@/hooks/use-theme';
import { formatDay } from '@/lib/remote-values';
import {
  NEWS_TAGS,
  type NewsFilter,
  type RegulatoryNews,
} from '@/lib/regulatory-news';

const FILTERS: readonly { value: NewsFilter; label: string }[] = [
  { value: 'all', label: 'Tout' },
  ...NEWS_TAGS.map((tag) => ({ value: tag, label: tag })),
];

function NewsCard({ item }: { item: RegulatoryNews }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => router.push(`/veille-reglementaire/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. ${item.tag}. Publié le ${formatDay(item.publishedDate)}.`}
      accessibilityHint="Ouvre l’article"
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
      <View style={styles.meta}>
        <ThemedView type="turquoiseTint" style={styles.tag}>
          <ThemedText type="caption" themeColor="turquoiseTintText">
            {item.tag}
          </ThemedText>
        </ThemedView>
        <ThemedText type="caption" themeColor="textSecondary">
          {formatDay(item.publishedDate)}
        </ThemedText>
      </View>
      <ThemedText type="sectionTitle">{item.title}</ThemedText>
      {item.excerpt ? (
        <ThemedText themeColor="textSecondary" numberOfLines={3}>
          {item.excerpt}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

export default function VeilleReglementaireScreen() {
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<NewsFilter>('all');
  const term = useDebouncedValue(query);
  const list = useRegulatoryNews(tag, term);
  const insets = useListInsets();
  const filtered = tag !== 'all' || term.trim().length >= 2;

  return (
    <StackScreen title="Veille réglementaire">
      <FlatList
        data={list.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NewsCard item={item} />}
        contentContainerStyle={insets}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={list.refreshing}
            onRefresh={list.refresh}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText themeColor="textSecondary">
              Les changements qui peuvent vous concerner, expliqués simplement.
            </ThemedText>
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher un sujet"
              label="Rechercher dans la veille réglementaire"
            />
            <FilterChips
              options={FILTERS}
              value={tag}
              onChange={setTag}
              label="Filtrer par territoire ou thème"
            />
            {list.status === 'ready' && list.error ? (
              <InlineError kind={list.error} onRetry={list.refresh} />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          list.status === 'loading' ? (
            <LoadingState label="Chargement des articles…" />
          ) : list.status === 'error' && list.error ? (
            <ErrorState kind={list.error} onRetry={list.retry} />
          ) : filtered ? (
            <EmptyState
              icon="search-outline"
              title="Aucun article trouvé"
              message="Essayez d’autres mots ou retirez un filtre."
            />
          ) : (
            <EmptyState
              icon="newspaper-outline"
              title="Aucun article publié pour le moment"
              message="Les informations vérifiées seront publiées ici, avec leur source et leur date."
            />
          )
        }
        ListFooterComponent={
          list.loadingMore ? (
            <ActivityIndicator accessibilityLabel="Chargement de la suite" />
          ) : null
        }
      />
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.three },
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 18,
    borderWidth: 1,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  tag: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 999,
  },
});
