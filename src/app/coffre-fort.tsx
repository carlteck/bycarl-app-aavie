import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { FilterChips } from '@/components/filter-chips';
import { OutlineButton } from '@/components/outline-button';
import { SearchField } from '@/components/search-field';
import {
  EmptyState,
  ErrorState,
  InlineError,
  LoadingState,
  Notice,
} from '@/components/screen-state';
import { StackScreen, useListInsets } from '@/components/stack-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CardShadow, Spacing } from '@/constants/theme';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useTheme } from '@/hooks/use-theme';
import { useVaultDocuments, useVaultTransfers } from '@/hooks/use-vault';
import { daysUntil, formatISODateLong } from '@/lib/reminder-date';
import {
  formatBytes,
  VAULT_CATEGORIES,
  type TransferState,
  type VaultDocument,
  type VaultFilter,
} from '@/lib/vault';

const FILTERS: readonly { value: VaultFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  ...VAULT_CATEGORIES,
];

const categoryLabel = (document: VaultDocument) =>
  VAULT_CATEGORIES.find((item) => item.value === document.category)?.label ??
  '';

const TRANSFER_TEXT = {
  pending: 'Envoi en attente',
  available: 'Disponible',
  failed: 'Envoi échoué',
} as const;

function expiryText(expiresOn: string): { text: string; alert: boolean } {
  const days = daysUntil(expiresOn);
  if (days < 0)
    return { text: `Expiré le ${formatISODateLong(expiresOn)}`, alert: true };
  if (days <= 30)
    return { text: `Expire le ${formatISODateLong(expiresOn)}`, alert: true };
  return {
    text: `Valable jusqu’au ${formatISODateLong(expiresOn)}`,
    alert: false,
  };
}

function DocumentRow({
  document,
  transfer,
  canDownload,
  onDownload,
}: {
  document: VaultDocument;
  transfer: TransferState | undefined;
  canDownload: boolean;
  onDownload: () => void;
}) {
  const theme = useTheme();
  const expiry = document.expiresOn ? expiryText(document.expiresOn) : null;
  const busy =
    transfer?.kind === 'uploading' || transfer?.kind === 'downloading';
  return (
    <View
      accessible={false}
      style={[
        styles.row,
        CardShadow,
        { backgroundColor: theme.background, borderColor: theme.cardBorder },
      ]}
    >
      <View style={styles.rowTop}>
        <Ionicons
          name="document-text-outline"
          size={24}
          color={theme.turquoiseTintText}
        />
        <View style={styles.body}>
          <ThemedText type="label">{document.title}</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {categoryLabel(document)} · {formatBytes(document.sizeBytes)}
          </ThemedText>
          {expiry ? (
            <ThemedText
              type="caption"
              themeColor={expiry.alert ? 'accent' : 'textSecondary'}
            >
              {expiry.text}
            </ThemedText>
          ) : null}
        </View>
      </View>
      <ThemedView type="backgroundElement" style={styles.status}>
        <ThemedText type="caption" themeColor="textSecondary">
          {busy
            ? transfer.kind === 'uploading'
              ? 'Envoi en cours…'
              : 'Téléchargement en cours…'
            : TRANSFER_TEXT[document.transferStatus]}
        </ThemedText>
      </ThemedView>
      {transfer?.kind === 'failed' ? (
        <ThemedText
          type="caption"
          themeColor="accent"
          accessibilityRole="alert"
        >
          {transfer.message}
        </ThemedText>
      ) : null}
      {canDownload && document.transferStatus === 'available' ? (
        <OutlineButton
          icon="download-outline"
          accessibilityLabel={`Télécharger ${document.title}`}
          onPress={busy ? () => {} : onDownload}
        >
          {busy ? 'Téléchargement…' : 'Télécharger'}
        </OutlineButton>
      ) : null}
    </View>
  );
}

export default function CoffreFortScreen() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<VaultFilter>('all');
  const term = useDebouncedValue(query);
  const list = useVaultDocuments(category, term);
  const { transfers, download, capabilities } = useVaultTransfers();
  const insets = useListInsets();
  const filtered = category !== 'all' || term.trim().length >= 2;

  return (
    <StackScreen title="Coffre-fort">
      <FlatList
        data={list.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DocumentRow
            document={item}
            transfer={transfers[item.id]}
            canDownload={capabilities.download}
            onDownload={() => void download(item)}
          />
        )}
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
              Retrouvez le bon justificatif au bon moment.
            </ThemedText>
            {!capabilities.upload ? (
              <Notice icon="lock-closed-outline">
                L’ajout et le téléchargement de documents ne sont pas encore
                activés. AAVIE ne demande donc aucune autorisation d’accès à vos
                photos ou à vos fichiers pour le moment.
              </Notice>
            ) : null}
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher un document"
              label="Rechercher un document"
            />
            <FilterChips
              options={FILTERS}
              value={category}
              onChange={setCategory}
              label="Filtrer par catégorie"
            />
            {list.status === 'ready' && list.error ? (
              <InlineError kind={list.error} onRetry={list.refresh} />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          list.status === 'loading' ? (
            <LoadingState label="Chargement de vos documents…" />
          ) : list.status === 'error' && list.error ? (
            <ErrorState kind={list.error} onRetry={list.retry} />
          ) : filtered ? (
            <EmptyState
              icon="search-outline"
              title="Aucun document trouvé"
              message="Essayez d’autres mots ou une autre catégorie."
            />
          ) : (
            <EmptyState
              icon="folder-open-outline"
              title="Votre coffre-fort est vide"
              message="Vos justificatifs apparaîtront ici, classés par catégorie."
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
  row: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 18,
    borderWidth: 1,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  body: { flex: 1, gap: Spacing.half },
  status: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 999,
  },
});
