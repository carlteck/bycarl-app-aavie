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
 * Contenu repris du cahier des charges (Amanda GOMME, 01/07/2024) résumé dans CLAUDE.md :
 * mission, public prioritaire et engagement d'accessibilité. La dernière section dit ce que
 * l'application ne fait pas — le CDC insiste sur l'autonomisation plutôt que la dépendance, et
 * annoncer les limites fait partie de cette promesse.
 */
const SECTIONS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'compass-outline',
    title: 'Notre mission',
    body: "Décomplexer l'administration et rendre les démarches accessibles à tous, quel que soit le niveau numérique. AAVIE accompagne vers l'autonomie : l'objectif est que vous sachiez faire, pas que vous dépendiez de l'application.",
  },
  {
    icon: 'location-outline',
    title: 'Pensé pour la Guyane',
    body: "Conçu d'abord pour la Guyane et les DROM-COM, face à l'illectronisme, à l'illettrisme et à l'isolement géographique, alors que l'administration se dématérialise. L'extension à l'Hexagone est prévue ensuite, notamment pour les zones rurales.",
  },
  {
    icon: 'people-outline',
    title: 'Pour qui',
    body: 'Particuliers, professionnels (TPE et indépendants), ressortissants étrangers et personnes en situation de handicap.',
  },
  {
    icon: 'accessibility-outline',
    title: "Notre engagement d'accessibilité",
    body: "L'accessibilité est intégrée dès la conception, pas ajoutée après coup : compatibilité lecteurs d'écran, taille de texte et contrastes ajustables, zones tactiles larges, parcours courts, interface épurée et jamais d'information transmise par la seule couleur.",
  },
  {
    icon: 'lock-closed-outline',
    title: 'Vos données',
    body: "Vos informations restent aujourd'hui sur votre téléphone, protégées par votre code à quatre chiffres et, si vous l'activez, par Face ID ou votre empreinte. Rien n'est envoyé sans votre action.",
  },
  {
    icon: 'alert-circle-outline',
    title: "Ce qu'AAVIE ne fait pas",
    body: "AAVIE ne remplit ni ne transmet un formulaire à votre place sur un site tiers, et ne remplace pas un conseil juridique. L'application prépare, explique et organise — la décision et l'envoi restent les vôtres.",
  },
];

/** Page publique « À propos » — accessible depuis l'accueil, avant toute connexion. */
export default function AProposScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <ThemedView type="pageBackground" style={styles.screen}>
      <ScreenHeaderBar
        title="À propos d’AAVIE"
        onBack={() => router.back()}
        backLabel="Accueil"
      />

      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.pageBackground }]}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingLeft: Spacing.four + safeAreaInsets.left,
            paddingRight: Spacing.four + safeAreaInsets.right,
            paddingBottom: safeAreaInsets.bottom + Spacing.four,
          },
        ]}
      >
        <View style={styles.container}>
          <ThemedText type="screenTitle">
            Assistant Administratif Virtuel Intelligent et Éducatif
          </ThemedText>

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
                <ThemedText type="sectionTitle" style={styles.cardTitle}>
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
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: Spacing.four,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.four,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  cardTitle: {
    flex: 1,
  },
});
