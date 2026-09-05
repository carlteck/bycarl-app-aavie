import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ScreenHeaderBar } from '@/components/screen-header-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function CreditsScreen() {
  return (
    <ThemedView type="pageBackground" style={styles.screen}>
      <ScreenHeaderBar
        title="Mes crédits"
        onBack={() => router.back()}
        backLabel="Mon compte"
      />
      <View style={styles.content}>
        <ThemedText type="sectionTitle">Crédits et forfaits</ThemedText>
        <ThemedText themeColor="textSecondary">
          Les crédits et forfaits ne sont pas encore disponibles pour votre
          compte mobile. Aucun achat ni crédit n’est nécessaire pour tester le
          planificateur et l’annuaire.
        </ThemedText>
      </View>
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
});
