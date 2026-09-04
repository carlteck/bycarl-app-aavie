import type { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientHeader } from '@/components/gradient-header';
import { IconChip } from '@/components/icon-chip';
import { OutlineButton } from '@/components/outline-button';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CardShadow, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IconName = keyof typeof Ionicons.glyphMap;

/**
 * Les huit services reprennent ceux de la page d'accueil publique du site
 * (`src/pages/LandingPage.tsx`), libellés compris, pour que la promesse soit la même sur les deux
 * supports. Liste en une colonne plutôt qu'en grille : le CDC demande une mise en page épurée et
 * linéaire, et une grille de huit cartes avec description est illisible sur un téléphone.
 */
const SERVICES: { icon: IconName; title: string; description: string }[] = [
  {
    icon: 'chatbubbles-outline',
    title: 'Assistant administratif',
    description: "Une démarche à la fois, expliquée simplement, jusqu'à l'envoi.",
  },
  {
    icon: 'create-outline',
    title: 'Aide rédactionnelle',
    description: 'Des courriers administratifs rédigés avec vous.',
  },
  {
    icon: 'calendar-outline',
    title: 'Planificateur',
    description: 'Toutes vos échéances au même endroit.',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Coffre-fort',
    description: 'Vos documents numérisés, classés et protégés.',
  },
  {
    icon: 'wallet-outline',
    title: 'Gestion de budget',
    description: 'Suivez vos revenus, dépenses et aides.',
  },
  {
    icon: 'newspaper-outline',
    title: 'Veille réglementaire',
    description: 'Les évolutions qui vous concernent, sans jargon.',
  },
  {
    icon: 'book-outline',
    title: 'Centre de ressources',
    description: 'Des guides pratiques pour chaque démarche.',
  },
  {
    icon: 'call-outline',
    title: 'Annuaire administratif',
    description: 'Les bons contacts, près de chez vous.',
  },
];

/** Page d'accueil publique — équivalent mobile de `/` sur le site. */
export default function AccueilPublicScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <ThemedView style={styles.screen}>
      <GradientHeader
        brand
        icon="home-outline"
        title="Vos démarches administratives, enfin simples"
        intro="AAVIE vous guide pas à pas, sécurise vos documents et vous prévient avant chaque échéance importante."
      />

      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingLeft: Spacing.four + safeAreaInsets.left,
            paddingRight: Spacing.four + safeAreaInsets.right,
          },
        ]}>
        <View style={styles.container}>
          <ThemedText type="sectionTitle">Tout ce qu&apos;il vous faut, au même endroit</ThemedText>

          <View style={styles.services}>
            {SERVICES.map((service) => (
              <View
                key={service.title}
                style={[
                  styles.serviceRow,
                  { borderColor: theme.cardBorder, backgroundColor: theme.background },
                  CardShadow,
                ]}>
                <IconChip name={service.icon} />
                <View style={styles.serviceText}>
                  <ThemedText type="label">{service.title}</ThemedText>
                  <ThemedText type="caption" themeColor="textSecondary">
                    {service.description}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>

          {/* `router.push` plutôt que `<Link asChild>` : `Link` clone son enfant et lui repasse
              un style, ce qu'il refuse sous forme de tableau. C'est aussi la façon dont navigue
              le reste du dépôt (`annuaire-entry-card`, `list-row`). */}
          <Pressable
            onPress={() => router.push('/a-propos')}
            accessibilityRole="link"
            accessibilityLabel="À propos d’AAVIE">
            {({ pressed }) => (
              <View
                style={[
                  styles.aboutRow,
                  {
                    borderColor: theme.cardBorder,
                    backgroundColor: theme.turquoiseTint,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}>
                <IconChip name="information-circle-outline" variant="primary" />
                <View style={styles.serviceText}>
                  <ThemedText type="label" themeColor="turquoiseTintText">
                    À propos d’AAVIE
                  </ThemedText>
                  <ThemedText type="caption" themeColor="turquoiseTintText">
                    Notre mission, pour qui, et ce que l’application fait — ou ne fait pas.
                  </ThemedText>
                </View>
              </View>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* Actions ancrées : dans le flux, elles disparaissaient dès le premier défilement. */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.cardBorder,
            paddingBottom: safeAreaInsets.bottom + Spacing.three,
            paddingLeft: Spacing.four + safeAreaInsets.left,
            paddingRight: Spacing.four + safeAreaInsets.right,
          },
        ]}>
        <View style={styles.footerInner}>
          <PrimaryButton onPress={() => router.push('/inscription')} icon="person-add-outline">
            Créer mon compte
          </PrimaryButton>
          <OutlineButton onPress={() => router.push('/connexion')} icon="log-in-outline">
            J’ai déjà un compte
          </OutlineButton>
        </View>
      </View>
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
    paddingBottom: Spacing.four,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  services: {
    gap: Spacing.two,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.four,
  },
  serviceText: {
    flex: 1,
    gap: Spacing.half,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.four,
    minHeight: 44,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: Spacing.three,
    alignItems: 'center',
  },
  footerInner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.two,
  },
});
