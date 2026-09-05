import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
      <ThemedText type="label" themeColor="turquoiseTintText">
        Bientôt disponible sur mobile
      </ThemedText>
      <ThemedText themeColor="textSecondary">
        L’assistant vous aidera à comprendre vos démarches et à préparer vos
        documents, étape par étape.
      </ThemedText>
      <View
        style={[styles.notice, { backgroundColor: theme.backgroundElement }]}
      >
        <ThemedText themeColor="textSecondary">
          La conversation n’est pas encore disponible dans l’application. Vous
          pouvez déjà organiser vos échéances dans le planificateur et trouver
          un organisme dans l’annuaire.
        </ThemedText>
      </View>
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
  notice: { borderRadius: 10, padding: Spacing.three },
});
