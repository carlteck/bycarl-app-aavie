import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { OutlineButton } from '@/components/outline-button';
import { RichText } from '@/components/rich-text';
import { EmptyState, ResourceView } from '@/components/screen-state';
import { StackScreen, useListInsets } from '@/components/stack-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useResource } from '@/hooks/use-catalogs';
import { openExternalLink } from '@/lib/open-link';
import { asId } from '@/lib/remote-values';

export default function ResourceDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = asId(params.id);
  return (
    <StackScreen title="Ressource" backLabel="Ressources">
      {id ? (
        <Detail id={id} />
      ) : (
        <EmptyState
          icon="alert-circle-outline"
          title="Ressource introuvable"
          message="Ce lien ne correspond à aucune ressource."
        />
      )}
    </StackScreen>
  );
}

function Detail({ id }: { id: string }) {
  const resource = useResource(id);
  const insets = useListInsets();
  return (
    <ResourceView
      resource={resource}
      loadingLabel="Chargement de la ressource…"
      missing={{
        title: 'Ressource introuvable',
        message: 'Elle a peut-être été retirée du centre de ressources.',
      }}
    >
      {(item) => (
        <ScrollView contentContainerStyle={insets}>
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
          <ThemedText type="screenTitle" accessibilityRole="header">
            {item.title}
          </ThemedText>
          {item.description ? (
            <ThemedText themeColor="textSecondary">
              {item.description}
            </ThemedText>
          ) : null}
          {item.content ? <RichText source={item.content} /> : null}
          {item.url ? (
            <OutlineButton
              icon="open-outline"
              accessibilityLabel={`Ouvrir le lien de ${item.title} dans le navigateur`}
              onPress={() => void openExternalLink(item.url!)}
            >
              Ouvrir le lien
            </OutlineButton>
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
});
