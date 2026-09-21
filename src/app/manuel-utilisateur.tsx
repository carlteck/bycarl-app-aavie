import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { IconChip } from '@/components/icon-chip';
import { SearchField } from '@/components/search-field';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/screen-state';
import { StackScreen, useListInsets } from '@/components/stack-screen';
import { ThemedText } from '@/components/themed-text';
import { CardShadow, Spacing } from '@/constants/theme';
import { useManual } from '@/hooks/use-catalogs';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useTheme } from '@/hooks/use-theme';
import {
  searchManual,
  type ManualArticleSummary,
  type ManualSection,
} from '@/lib/manual';

type IconName = keyof typeof Ionicons.glyphMap;

/** Le nom d'icône vient de la base : inconnu, il retombe sur une icône par défaut. */
function iconFor(name: string | undefined): IconName {
  return name && name in Ionicons.glyphMap
    ? (name as IconName)
    : 'book-outline';
}

type Row =
  | { type: 'section'; key: string; section: ManualSection }
  | {
      type: 'article';
      key: string;
      article: ManualArticleSummary;
      sectionTitle?: string;
    };

function ArticleRow({
  article,
  sectionTitle,
}: {
  article: ManualArticleSummary;
  sectionTitle?: string;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => router.push(`/manuel-utilisateur/${article.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${article.title}${sectionTitle ? `, chapitre ${sectionTitle}` : ''}`}
      accessibilityHint="Ouvre l’explication"
      style={({ pressed }) => [
        styles.article,
        CardShadow,
        {
          backgroundColor: theme.background,
          borderColor: theme.cardBorder,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <View style={styles.articleBody}>
        <ThemedText type="label">{article.title}</ThemedText>
        {sectionTitle ? (
          <ThemedText type="caption" themeColor="turquoiseTintText">
            {sectionTitle}
          </ThemedText>
        ) : null}
        {article.summary ? (
          <ThemedText
            type="caption"
            themeColor="textSecondary"
            numberOfLines={2}
          >
            {article.summary}
          </ThemedText>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.primary} />
    </Pressable>
  );
}

export default function ManuelUtilisateurScreen() {
  const manual = useManual();
  const { refreshing, onRefresh } = usePullToRefresh(manual.reload);
  const insets = useListInsets();
  const [query, setQuery] = useState('');
  const sections = useMemo(() => manual.data ?? [], [manual.data]);
  const searching = query.trim().length > 0;

  const rows = useMemo<Row[]>(() => {
    if (searching)
      return searchManual(sections, query).map(({ article, sectionTitle }) => ({
        type: 'article',
        key: article.id,
        article,
        sectionTitle,
      }));
    return sections.flatMap<Row>((section) => [
      { type: 'section', key: `s-${section.id}`, section },
      ...section.articles.map<Row>((article) => ({
        type: 'article',
        key: article.id,
        article,
      })),
    ]);
  }, [sections, query, searching]);

  const loading = manual.status === 'loading';

  return (
    <StackScreen title="Manuel utilisateur">
      <FlatList
        data={loading ? [] : rows}
        keyExtractor={(row) => row.key}
        renderItem={({ item }) =>
          item.type === 'section' ? (
            <View style={styles.section}>
              <IconChip name={iconFor(item.section.icon)} size={36} />
              <View style={styles.articleBody}>
                <ThemedText type="sectionTitle" accessibilityRole="header">
                  {item.section.title}
                </ThemedText>
                {item.section.summary ? (
                  <ThemedText type="caption" themeColor="textSecondary">
                    {item.section.summary}
                  </ThemedText>
                ) : null}
              </View>
            </View>
          ) : (
            <ArticleRow
              article={item.article}
              sectionTitle={item.sectionTitle}
            />
          )
        }
        contentContainerStyle={insets}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText themeColor="textSecondary">
              Apprenez à utiliser AAVIE étape par étape.
            </ThemedText>
            {sections.length > 0 ? (
              <SearchField
                value={query}
                onChangeText={setQuery}
                placeholder="Rechercher dans le manuel"
                label="Rechercher dans le manuel"
              />
            ) : null}
            {searching && !loading ? (
              <ThemedText
                type="caption"
                themeColor="textSecondary"
                accessibilityLiveRegion="polite"
              >
                {rows.length} résultat{rows.length > 1 ? 's' : ''}
              </ThemedText>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <LoadingState label="Chargement du manuel…" />
          ) : manual.status === 'error' && manual.error ? (
            <ErrorState kind={manual.error} onRetry={manual.retry} />
          ) : searching ? (
            <EmptyState
              icon="search-outline"
              title="Aucun résultat"
              message="Essayez d’autres mots, par exemple « échéance » ou « budget »."
            />
          ) : (
            <EmptyState
              icon="school-outline"
              title="Le manuel est en cours de rédaction"
              message="Les explications apparaîtront ici dès leur publication."
            />
          )
        }
      />
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.three },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.three,
  },
  article: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 18,
    borderWidth: 1,
  },
  articleBody: { flex: 1, gap: Spacing.half },
});
