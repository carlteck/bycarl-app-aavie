import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { PrimaryButton } from './primary-button';

export function AssistantPromptCard() {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, borderColor: theme.cardBorder },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: theme.turquoiseTint }]}>
        <Ionicons
          name="chatbubbles-outline"
          size={28}
          color={theme.turquoiseTintText}
        />
      </View>
      <ThemedText type="sectionTitle" accessibilityRole="header">
        Votre assistant administratif
      </ThemedText>
      <ThemedText themeColor="textSecondary">
        L’assistant vous aide à comprendre vos démarches et à préparer vos
        documents, étape par étape.
      </ThemedText>
      <PrimaryButton
        icon="chatbubble-ellipses-outline"
        onPress={() => router.push('/assistant')}
      >
        Demander à l’assistant
      </PrimaryButton>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.four,
    borderWidth: 1,
    borderRadius: 12,
    gap: Spacing.three,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
