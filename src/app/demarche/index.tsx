import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AssistantPromptCard } from '@/components/assistant-prompt-card';
import { ScreenHeaderBar } from '@/components/screen-header-bar';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function DemarcheCatalogueScreen() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <ThemedView type="pageBackground" style={styles.screen}>
      <ScreenHeaderBar
        title="Assistant administratif"
        onBack={() => router.back()}
        backLabel="Accueil"
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.content,
            {
              paddingLeft: Spacing.four + safeAreaInsets.left,
              paddingRight: Spacing.four + safeAreaInsets.right,
              paddingBottom: safeAreaInsets.bottom + Spacing.four,
            },
          ]}
        >
          <AssistantPromptCard />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.four,
  },
});
