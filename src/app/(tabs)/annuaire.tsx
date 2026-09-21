import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { AnnuaireEntryCard } from '@/components/annuaire-entry-card';
import { FilterChips } from '@/components/filter-chips';
import { PageHeader } from '@/components/page-header';
import { SearchField } from '@/components/search-field';
import { EmptyState, LoadingState, Notice } from '@/components/screen-state';
import { useTabListInsets } from '@/components/stack-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  ANNUAIRE_CATEGORIES,
  ANNUAIRE_ENTRIES,
  type AnnuaireEntry,
} from '@/constants/annuaire';
import { Spacing } from '@/constants/theme';
import { useAnnuaire } from '@/hooks/use-catalogs';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useTheme } from '@/hooks/use-theme';
import { normalize } from '@/lib/manual';

const ALL = '__all__';

/** Catégories connues d'abord (ordre du produit), puis les autres par ordre alphabétique. */
function categoriesOf(entries: readonly AnnuaireEntry[]): string[] {
  const present = new Set(entries.map((entry) => entry.category));
  const known = ANNUAIRE_CATEGORIES.filter((name) => present.has(name));
  const others = [...present]
    .filter((name) => !ANNUAIRE_CATEGORIES.some((known) => known === name))
    .sort((a, b) => a.localeCompare(b, 'fr'));
  return [...known, ...others];
}

export default function AnnuaireScreen() {
  const theme = useTheme();
  const insets = useTabListInsets();
  const directory = useAnnuaire();
  const { refreshing, onRefresh } = usePullToRefresh(directory.reload);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL);

  // Source affichée. Jamais de repli SILENCIEUX : la liste intégrée ne remplace l'annuaire publié
  // que s'il est vide ou injoignable, et l'écran le dit. Justification : cette liste (préfecture,
  // CAF, CPAM…) est réelle et déjà utile hors ligne ; une page vide serait pire pour un public
  // peu connecté.
  const published = directory.data ?? [];
  const usesEmbedded = published.length === 0;
  const entries = usesEmbedded ? ANNUAIRE_ENTRIES : published;
  const loading = directory.status === 'loading';

  const chips = useMemo(
    () => [
      { value: ALL, label: 'Tous' },
      ...categoriesOf(entries).map((name) => ({ value: name, label: name })),
    ],
    [entries],
  );

  // Une catégorie choisie puis disparue (actualisation) équivaut à « Tous ».
  const activeCategory = chips.some((chip) => chip.value === category)
    ? category
    : ALL;

  const results = useMemo(() => {
    const words = normalize(query).split(' ').filter(Boolean);
    return entries.filter((entry) => {
      if (activeCategory !== ALL && entry.category !== activeCategory)
        return false;
      const haystack = normalize(
        `${entry.name} ${entry.category} ${entry.description} ${entry.address ?? ''}`,
      );
      return words.every((word) => haystack.includes(word));
    });
  }, [entries, query, activeCategory]);

  return (
    <ThemedView type="background" style={styles.screen}>
      <PageHeader
        icon="business-outline"
        title="Les bons contacts."
        intro="Trouvez le bon interlocuteur pour avancer."
      />
      <FlatList
        style={{ backgroundColor: theme.background }}
        data={loading ? [] : results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AnnuaireEntryCard {...item} />}
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
            {directory.status === 'error' && usesEmbedded ? (
              <Notice
                icon="cloud-offline-outline"
                action={{ label: 'Réessayer', onPress: directory.retry }}
              >
                L’annuaire à jour n’a pas pu être chargé. La liste de référence
                intégrée à l’application est affichée en attendant.
              </Notice>
            ) : directory.status === 'ready' && usesEmbedded ? (
              <Notice icon="information-circle-outline">
                L’annuaire à jour n’est pas encore publié. La liste de référence
                intégrée à l’application est affichée en attendant.
              </Notice>
            ) : directory.status === 'error' ? (
              <Notice
                icon="cloud-offline-outline"
                action={{ label: 'Réessayer', onPress: directory.retry }}
              >
                La mise à jour a échoué : cette liste peut ne pas être à jour.
              </Notice>
            ) : null}
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder="CAF, mairie, préfecture…"
              label="Rechercher un organisme"
            />
            <FilterChips
              options={chips}
              value={activeCategory}
              onChange={setCategory}
              label="Filtrer par catégorie"
            />
            {!loading ? (
              <ThemedText
                type="caption"
                themeColor="textSecondary"
                accessibilityLiveRegion="polite"
              >
                {results.length} organisme{results.length > 1 ? 's' : ''}
              </ThemedText>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <LoadingState label="Chargement de l’annuaire…" />
          ) : (
            <EmptyState
              icon="search-outline"
              title="Aucun organisme trouvé"
              message="Essayez d’autres mots ou une autre catégorie."
            />
          )
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { gap: Spacing.three },
});
