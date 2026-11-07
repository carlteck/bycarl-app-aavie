import { useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { RichText } from '@/components/rich-text';
import { EmptyState, ResourceView } from '@/components/screen-state';
import { StackScreen, useListInsets } from '@/components/stack-screen';
import { ThemedText } from '@/components/themed-text';
import { LEGAL_LINKS, type LegalDocumentType } from '@/constants/legal';
import { Spacing } from '@/constants/theme';
import { useLocale } from '@/context/locale-context';
import { useRemoteResource } from '@/hooks/use-remote-resource';
import { fetchLegalDocument, isLegalDocumentType } from '@/lib/legal';

const titles: Record<LegalDocumentType, string> = {
  privacy_policy: LEGAL_LINKS.privacy.label,
  terms: LEGAL_LINKS.terms.label,
  terms_of_sale: LEGAL_LINKS.sales.label,
  legal_notice: LEGAL_LINKS.notice.label,
};

export default function LegalDocumentScreen() {
  const { type: rawType } = useLocalSearchParams<{ type: string }>();
  const type = isLegalDocumentType(rawType) ? rawType : null;

  return (
    <StackScreen title={type ? titles[type] : 'Informations légales'} backLabel="Retour">
      {type ? <Document type={type} /> : (
        <EmptyState
          icon="document-text-outline"
          title="Document introuvable"
          message="Ce lien ne correspond à aucun document juridique."
        />
      )}
    </StackScreen>
  );
}

function Document({ type }: { type: LegalDocumentType }) {
  const insets = useListInsets();
  const { intlLocale, translateText } = useLocale();
  const load = useCallback(
    (signal: AbortSignal) => fetchLegalDocument(type, signal),
    [type],
  );
  const document = useRemoteResource(load);
  const date = useMemo(
    () => new Intl.DateTimeFormat(intlLocale, { dateStyle: 'long' }),
    [intlLocale],
  );

  return (
    <ResourceView
      resource={document}
      loadingLabel="Chargement du document…"
      missing={{
        title: 'Document non publié',
        message: 'Aucune version active de ce document n’est disponible.',
      }}
    >
      {(item) => (
        <ScrollView contentContainerStyle={insets}>
          <View style={styles.heading}>
            <ThemedText type="screenTitle" accessibilityRole="header">
              {item.title}
            </ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              {translateText('Version')} {item.version}
              {item.publishedAt
                ? ` · ${translateText('En vigueur depuis le')} ${date.format(new Date(item.publishedAt))}`
                : ''}
            </ThemedText>
          </View>
          <RichText source={item.content} />
        </ScrollView>
      )}
    </ResourceView>
  );
}

const styles = StyleSheet.create({
  heading: { gap: Spacing.two, marginBottom: Spacing.two },
});
