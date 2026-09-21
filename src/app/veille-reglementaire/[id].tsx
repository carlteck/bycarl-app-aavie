import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { OutlineButton } from '@/components/outline-button';
import { RichText } from '@/components/rich-text';
import { EmptyState, ResourceView } from '@/components/screen-state';
import { StackScreen, useListInsets } from '@/components/stack-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useRegulatoryNewsItem } from '@/hooks/use-catalogs';
import { openExternalLink } from '@/lib/open-link';
import { asId, formatDay } from '@/lib/remote-values';

export default function NewsDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = asId(params.id);
  return (
    <StackScreen title="Article" backLabel="Veille">
      {id ? (
        <Article id={id} />
      ) : (
        <EmptyState
          icon="alert-circle-outline"
          title="Article introuvable"
          message="Ce lien ne correspond à aucun article."
        />
      )}
    </StackScreen>
  );
}

function Article({ id }: { id: string }) {
  const news = useRegulatoryNewsItem(id);
  const insets = useListInsets();
  return (
    <ResourceView
      resource={news}
      loadingLabel="Chargement de l’article…"
      missing={{
        title: 'Article introuvable',
        message: 'Il a peut-être été retiré de la veille.',
      }}
    >
      {(item) => (
        <ScrollView contentContainerStyle={insets}>
          <View style={styles.meta}>
            <ThemedView type="turquoiseTint" style={styles.tag}>
              <ThemedText type="caption" themeColor="turquoiseTintText">
                {item.tag}
              </ThemedText>
            </ThemedView>
            <ThemedText type="caption" themeColor="textSecondary">
              Publié le {formatDay(item.publishedDate)}
            </ThemedText>
          </View>
          <ThemedText type="screenTitle" accessibilityRole="header">
            {item.title}
          </ThemedText>
          <RichText source={item.description} />
          {item.sourceName || item.sourceUrl ? (
            <View style={styles.source}>
              {item.sourceName ? (
                <ThemedText type="caption" themeColor="textSecondary">
                  Source : {item.sourceName}
                </ThemedText>
              ) : null}
              {item.sourceUrl ? (
                <OutlineButton
                  icon="open-outline"
                  accessibilityLabel={`Ouvrir la source${item.sourceName ? ` ${item.sourceName}` : ''} dans le navigateur`}
                  onPress={() => void openExternalLink(item.sourceUrl!)}
                >
                  Ouvrir la source
                </OutlineButton>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      )}
    </ResourceView>
  );
}

const styles = StyleSheet.create({
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  tag: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 999,
  },
  source: { gap: Spacing.two, paddingTop: Spacing.two },
});
