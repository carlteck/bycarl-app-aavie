import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CardShadow, Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AccueilPublicScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { width, height, fontScale } = useWindowDimensions();
  const compact = height < 740 || width < 360;
  const showIllustration = fontScale < 1.5;

  return (
    <ThemedView type="background" style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing.two,
            paddingBottom: insets.bottom + Spacing.two,
            paddingLeft: insets.left + Spacing.four,
            paddingRight: insets.right + Spacing.four,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.brand} accessible accessibilityLabel="AAVIE">
              <Image
                source={require('@/assets/images/aavie-logo-mark.png')}
                style={styles.logo}
                contentFit="contain"
                accessibilityIgnoresInvertColors
              />
              <ThemedText style={styles.brandName}>AAVIE</ThemedText>
            </View>
            <Pressable
              onPress={() => router.push('/a-propos')}
              accessibilityRole="link"
              style={({ pressed }) => [
                styles.about,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <ThemedText type="label" themeColor="primary">
                À propos
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.hero}>
            {showIllustration && (
              <View
                style={[
                  styles.illustration,
                  compact && styles.illustrationCompact,
                ]}
                pointerEvents="none"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                aria-hidden
              >
                <View
                  style={[
                    styles.orbit,
                    { backgroundColor: theme.turquoiseTint },
                  ]}
                >
                  <View
                    style={[
                      styles.orbitRing,
                      { borderColor: theme.turquoisePressed },
                    ]}
                  />
                </View>
                <View
                  style={[
                    styles.floatingCard,
                    styles.documentCard,
                    CardShadow,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.icon,
                      { backgroundColor: theme.turquoiseTint },
                    ]}
                  >
                    <Ionicons
                      name="documents-outline"
                      size={23}
                      color={theme.turquoiseTintText}
                    />
                  </View>
                  <View style={styles.cardCopy}>
                    <ThemedText type="label">
                      Chaque chose à sa place.
                    </ThemedText>
                    <ThemedText type="caption" themeColor="textSecondary">
                      Vos démarches, plus claires.
                    </ThemedText>
                  </View>
                </View>
                <View
                  style={[
                    styles.floatingCard,
                    styles.calendarCard,
                    CardShadow,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.icon,
                      { backgroundColor: theme.turquoiseTint },
                    ]}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={23}
                      color={theme.turquoiseTintText}
                    />
                  </View>
                  <View style={styles.cardCopy}>
                    <ThemedText type="label">L’esprit plus léger.</ThemedText>
                    <ThemedText type="caption" themeColor="textSecondary">
                      Vos dates importantes, réunies.
                    </ThemedText>
                  </View>
                </View>
                <View
                  style={[styles.rhythm, { backgroundColor: theme.primary }]}
                >
                  <Ionicons name="checkmark" size={16} color={Palette.white} />
                  <ThemedText type="caption" style={styles.whiteText}>
                    À votre rythme
                  </ThemedText>
                </View>
              </View>
            )}

            <View style={[styles.intro, compact && styles.introCompact]}>
              <ThemedText
                type="caption"
                themeColor="turquoiseTintText"
                style={styles.eyebrow}
              >
                VOTRE QUOTIDIEN, SIMPLIFIÉ
              </ThemedText>
              <ThemedText
                accessibilityRole="header"
                style={[styles.headline, compact && styles.headlineCompact]}
              >
                Moins de papiers.{'\n'}Plus de sérénité.
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.description}>
                Un espace pour vos démarches,{'\n'}et du temps pour ce qui
                compte.
              </ThemedText>
              <View style={styles.local}>
                <Ionicons
                  name="location-outline"
                  size={17}
                  color={theme.turquoiseTintText}
                />
                <ThemedText
                  type="caption"
                  themeColor="turquoiseTintText"
                  style={styles.localText}
                >
                  Pensé pour vous, en Guyane.
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => router.push('/inscription')}
              accessibilityRole="button"
              accessibilityLabel="Créer mon compte"
              style={({ pressed }) => [
                styles.createButton,
                {
                  backgroundColor: pressed
                    ? theme.primaryPressed
                    : theme.primary,
                },
              ]}
            >
              <ThemedText
                type="label"
                style={[styles.whiteText, styles.buttonLabel]}
              >
                Créer mon compte
              </ThemedText>
              <Ionicons name="arrow-forward" size={21} color={Palette.white} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/connexion')}
              accessibilityRole="link"
              accessibilityLabel="Déjà un compte ? Se connecter"
              style={({ pressed }) => [
                styles.signIn,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <ThemedText
                type="label"
                themeColor="textSecondary"
                style={styles.signInText}
              >
                Déjà un compte ?{' '}
                <ThemedText type="label" themeColor="primary">
                  Se connecter
                </ThemedText>
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { width: '100%', maxWidth: 440, alignSelf: 'center', flexGrow: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },
  logo: { width: 34, height: 38 },
  brandName: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -1,
  },
  about: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  hero: { flexGrow: 1, justifyContent: 'center' },
  illustration: {
    height: 266,
    marginTop: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationCompact: { height: 228, marginTop: Spacing.two },
  orbit: {
    width: 216,
    height: 216,
    borderRadius: 108,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbitRing: {
    width: 177,
    height: 177,
    borderRadius: 89,
    borderWidth: 1,
    opacity: 0.25,
  },
  floatingCard: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    width: '92%',
    maxWidth: 320,
  },
  documentCard: { left: 0, top: '17%', transform: [{ rotate: '-7deg' }] },
  calendarCard: { right: 0, top: '48%', transform: [{ rotate: '6deg' }] },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: { flex: 1, gap: 3 },
  rhythm: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 24,
  },
  intro: { paddingTop: 28, paddingBottom: Spacing.four, gap: 14 },
  introCompact: { paddingTop: 22, paddingBottom: Spacing.three, gap: 12 },
  eyebrow: { letterSpacing: 1.6, fontWeight: '600' },
  headline: {
    fontSize: 38,
    lineHeight: 43,
    letterSpacing: -1.5,
    fontWeight: '600',
  },
  headlineCompact: { fontSize: 33, lineHeight: 38, letterSpacing: -1.2 },
  description: { lineHeight: 25 },
  local: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  localText: { flexShrink: 1 },
  actions: { paddingTop: Spacing.two, gap: Spacing.two },
  createButton: {
    minHeight: 54,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  whiteText: { color: Palette.white },
  buttonLabel: { fontSize: 16, lineHeight: 23, flexShrink: 1 },
  signIn: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
  },
  signInText: { textAlign: 'center', fontWeight: '400' },
});
