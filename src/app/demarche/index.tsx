import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AssistantPromptCard } from '@/components/assistant-prompt-card';
import { ScreenHeaderBar } from '@/components/screen-header-bar';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';

export default function DemarcheCatalogueScreen() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.screen}>
      <ScreenHeaderBar title="Démarches administratives" onBack={() => router.back()} backLabel="Accueil" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={safeAreaInsets.top}>
        <View
          style={[
            styles.content,
            {
              paddingLeft: Spacing.four + safeAreaInsets.left,
              paddingRight: Spacing.four + safeAreaInsets.right,
              paddingBottom: safeAreaInsets.bottom + BottomTabInset,
            },
          ]}>
          <AssistantPromptCard />
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
