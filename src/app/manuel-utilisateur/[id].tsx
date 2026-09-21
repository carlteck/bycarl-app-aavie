import { useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';

import { RichText } from '@/components/rich-text';
import { EmptyState, ResourceView } from '@/components/screen-state';
import { StackScreen, useListInsets } from '@/components/stack-screen';
import { ThemedText } from '@/components/themed-text';
import { useManualArticle } from '@/hooks/use-catalogs';
import { asId } from '@/lib/remote-values';

export default function ManualArticleScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = asId(params.id);
  return (
    <StackScreen title="Manuel" backLabel="Manuel utilisateur">
      {id ? (
        <Article id={id} />
      ) : (
        <EmptyState
          icon="alert-circle-outline"
          title="Explication introuvable"
          message="Ce lien ne correspond à aucune explication."
        />
      )}
    </StackScreen>
  );
}

function Article({ id }: { id: string }) {
  const article = useManualArticle(id);
  const insets = useListInsets();
  return (
    <ResourceView
      resource={article}
      loadingLabel="Chargement de l’explication…"
      missing={{
        title: 'Explication introuvable',
        message: 'Elle a peut-être été retirée du manuel.',
      }}
    >
      {(item) => (
        <ScrollView contentContainerStyle={insets}>
          {item.sectionTitle ? (
            <ThemedText type="caption" themeColor="turquoiseTintText">
              {item.sectionTitle}
            </ThemedText>
          ) : null}
          <ThemedText type="screenTitle" accessibilityRole="header">
            {item.title}
          </ThemedText>
          {item.summary ? (
            <ThemedText themeColor="textSecondary">{item.summary}</ThemedText>
          ) : null}
          <RichText source={item.body} />
        </ScrollView>
      )}
    </ResourceView>
  );
}
