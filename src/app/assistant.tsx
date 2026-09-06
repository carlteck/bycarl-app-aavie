import type { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconChip } from '@/components/icon-chip';
import { ScreenHeaderBar } from '@/components/screen-header-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CardShadow, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IconName = keyof typeof Ionicons.glyphMap;

/**
 * Assistant administratif — présentation, en attendant le service.
 *
 * ⚠️ **Cet écran n'appelle rien et ne doit pas faire semblant.** L'assistant existe côté site,
 * mais il s'appuie sur l'identité et le solde de crédits de la base MySQL, alors que
 * l'application authentifie ses usagers dans Supabase : ce sont deux fichiers de personnes
 * différents. Le brancher suppose d'abord de décider où vivent l'identité et les crédits — un
 * arbitrage en cours, pas un branchement à faire.
 *
 * D'ici là, mieux vaut une page qui dit ce qui arrive qu'un champ de saisie qui ne répond pas.
 * Le public visé est en difficulté avec le numérique : une fonctionnalité qui échoue en silence
 * lui fait conclure qu'il s'y est mal pris.
 */
const SECTIONS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'chatbubbles-outline',
    title: 'Poser vos questions simplement',
    body: "Vous écrirez votre situation avec vos mots, sans vocabulaire administratif. L'assistant expliquera chaque terme compliqué et vous guidera une étape à la fois.",
  },
  {
    icon: 'document-text-outline',
    title: 'Faire rédiger vos courriers',
    body: "Vous demanderez un courrier ou un e-mail — à la CAF, à la préfecture, à votre caisse de retraite — et vous pourrez le copier, l'imprimer ou l'enregistrer dans votre coffre-fort.",
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Ce qu’il ne fera pas',
    body: "L'assistant n'est pas un juriste et ne remplacera jamais un professionnel du droit sur un cas complexe. Il vous aide à comprendre et à préparer, pas à décider à votre place.",
  },
];

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <ThemedView type="pageBackground" style={styles.screen}>
      <ScreenHeaderBar
        title="Assistant administratif"
        onBack={() => router.back()}
        backLabel="Accueil"
      />

      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.pageBackground }]}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingLeft: Spacing.four + insets.left,
            paddingRight: Spacing.four + insets.right,
            paddingBottom: insets.bottom + Spacing.four,
          },
        ]}
      >
        <View style={styles.container}>
          <View
            style={[
              styles.notice,
              {
                backgroundColor: theme.turquoiseTint,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <IconChip name="time-outline" />
            <View style={styles.flex}>
              <ThemedText type="label" themeColor="turquoiseTintText">
                Bientôt disponible
              </ThemedText>
              <ThemedText type="caption" themeColor="turquoiseTintText">
                L’assistant se prépare. Voici ce qu’il fera pour vous.
              </ThemedText>
            </View>
          </View>

          {SECTIONS.map((section) => (
            <View
              key={section.title}
              style={[
                styles.card,
                {
                  borderColor: theme.cardBorder,
                  backgroundColor: theme.background,
                },
                CardShadow,
              ]}
            >
              <View style={styles.cardTop}>
                <IconChip name={section.icon} />
                <ThemedText type="sectionTitle" style={styles.flex}>
                  {section.title}
                </ThemedText>
              </View>
              <ThemedText themeColor="textSecondary">{section.body}</ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollView: { flex: 1 },
  contentContainer: { paddingTop: Spacing.four },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.four,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: 22,
    borderWidth: 1,
  },
  card: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: 22,
    borderWidth: 1,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  flex: { flex: 1 },
});
