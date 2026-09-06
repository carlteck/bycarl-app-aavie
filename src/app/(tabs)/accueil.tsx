import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReminderRow } from '@/components/reminder-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Palette, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useReminders } from '@/context/reminders-context';
import { useTheme } from '@/hooks/use-theme';
import { todayISO } from '@/lib/reminder-date';

const shortcuts = [
  { title: 'Planificateur', icon: 'calendar-outline', href: '/planificateur' },
  { title: 'Annuaire', icon: 'business-outline', href: '/annuaire' },
  { title: 'Tous les services', icon: 'grid-outline', href: '/services' },
] as const;

export default function AccueilScreen() {
  const { user } = useAuth();
  const { reminders, isLoaded } = useReminders();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const today = todayISO();
  const upcoming = reminders
    .filter((r) => r.dateISO >= today)
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
    .slice(0, 3);
  const overdue = reminders.filter((r) => r.dateISO < today).length;

  return (
    <ThemedView type="background" style={styles.screen}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + BottomTabInset + 32,
          paddingLeft: insets.left + 24,
          paddingRight: insets.right + 24,
        }}
      >
        <View style={styles.content}>
          <View style={styles.bar}>
            <View style={styles.brand} accessible accessibilityLabel="AAVIE">
              <Image
                source={require('@/assets/images/aavie-logo-mark.png')}
                contentFit="contain"
                style={styles.logo}
              />
              <ThemedText style={styles.brandName}>AAVIE</ThemedText>
            </View>
            <Pressable
              onPress={() => router.push('/profil')}
              accessibilityRole="button"
              accessibilityLabel="Ouvrir mon compte"
              style={({ pressed }) => [
                styles.avatar,
                {
                  backgroundColor: theme.turquoiseTint,
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
            >
              <ThemedText type="label" themeColor="turquoiseTintText">
                {user?.first_name?.charAt(0).toUpperCase() || 'A'}
              </ThemedText>
            </Pressable>
          </View>
          <View style={styles.greeting}>
            <ThemedText
              type="caption"
              themeColor="turquoiseTintText"
              style={styles.eyebrow}
            >
              VOTRE ESPACE, À VOTRE RYTHME
            </ThemedText>
            <ThemedText accessibilityRole="header" style={styles.title}>
              Bonjour{user?.first_name ? `, ${user.first_name}` : ''}.
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              On avance une chose après l’autre.
            </ThemedText>
          </View>
          <Pressable
            onPress={() => router.push('/assistant')}
            accessibilityRole="button"
            accessibilityLabel="Ouvrir l’assistant administratif, bientôt disponible"
            style={({ pressed }) => [
              styles.hero,
              { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <View
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={styles.heroDecoration}
            >
              <Ionicons
                name="chatbubbles-outline"
                size={86}
                color={Palette.white}
              />
            </View>
            <View style={styles.heroHeading}>
              <ThemedText style={styles.heroTitle}>
                Une question ?{'\n'}On la démêle ensemble.
              </ThemedText>
              <View style={styles.heroBadge}>
                <ThemedText type="caption" style={styles.heroBadgeText}>
                  Bientôt
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.heroCopy}>
              Expliquez votre situation avec vos mots. L’assistant traduit
              l’administratif et rédige vos courriers.
            </ThemedText>

            {/* Champ volontairement NON saisissable : l'assistant n'est pas encore branché, et
                un champ qui accepte du texte sans jamais répondre ferait conclure à l'usager
                qu'il s'y est mal pris. Toucher le bloc ouvre l'écran qui explique où on en est. */}
            <View
              style={styles.heroField}
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <ThemedText type="caption" style={styles.heroFieldPlaceholder}>
                Posez votre question…
              </ThemedText>
              <Ionicons name="mic-outline" size={20} color={Palette.midGrey} />
              <View
                style={[styles.heroSend, { backgroundColor: theme.primary }]}
              >
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={Palette.white}
                />
              </View>
            </View>
          </Pressable>
          <View style={styles.section}>
            <ThemedText type="sectionTitle" accessibilityRole="header">
              À portée de main
            </ThemedText>
            <View
              style={[styles.shortcuts, fontScale >= 1.5 && styles.stacked]}
            >
              {shortcuts.map((item) => (
                <Pressable
                  key={item.href}
                  onPress={() => router.push(item.href)}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.shortcut,
                    { opacity: pressed ? 0.6 : 1 },
                    fontScale >= 1.5 && styles.shortcutLarge,
                  ]}
                >
                  <View
                    style={[
                      styles.shortcutIcon,
                      { backgroundColor: theme.turquoiseTint },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={24}
                      color={theme.turquoiseTintText}
                    />
                  </View>
                  <ThemedText type="caption" style={styles.shortcutLabel}>
                    {item.title}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <ThemedText
                type="sectionTitle"
                accessibilityRole="header"
                style={styles.flex}
              >
                À venir
              </ThemedText>
              <Pressable
                onPress={() => router.push('/planificateur')}
                accessibilityRole="link"
                style={styles.textLink}
              >
                <ThemedText type="label" themeColor="primary">
                  Tout voir
                </ThemedText>
              </Pressable>
            </View>
            {!isLoaded ? (
              <ActivityIndicator
                color={theme.primary}
                accessibilityLabel="Chargement des échéances"
              />
            ) : (
              <>
                {overdue > 0 && (
                  <Pressable
                    onPress={() => router.push('/planificateur')}
                    accessibilityRole="button"
                    style={styles.overdue}
                  >
                    <ThemedText type="label" themeColor="accent">
                      {overdue} échéance{overdue > 1 ? 's' : ''} passée
                      {overdue > 1 ? 's' : ''} à vérifier →
                    </ThemedText>
                  </Pressable>
                )}
                {upcoming.length ? (
                  upcoming.map((reminder) => (
                    <ReminderRow
                      key={reminder.id}
                      reminder={reminder}
                      onPress={() => router.push('/planificateur')}
                    />
                  ))
                ) : (
                  <View
                    style={[
                      styles.empty,
                      { backgroundColor: theme.pageBackground },
                    ]}
                  >
                    <Ionicons
                      name="sunny-outline"
                      size={26}
                      color={theme.turquoiseTintText}
                    />
                    <View style={styles.flex}>
                      <ThemedText type="label">La suite est à vous.</ThemedText>
                      <ThemedText
                        type="caption"
                        themeColor="textSecondary"
                        style={styles.emptyCopy}
                      >
                        Aucune date à venir. Ajoutez votre première échéance
                        dans le planificateur.
                      </ThemedText>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: 26 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 32, height: 36 },
  brandName: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: { gap: 8 },
  eyebrow: { letterSpacing: 1.3, fontWeight: '600' },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '600',
    letterSpacing: -1.1,
  },
  hero: { borderRadius: 26, padding: 24, gap: 14, overflow: 'hidden' },
  heroDecoration: {
    position: 'absolute',
    right: -12,
    top: 12,
    opacity: 0.08,
    transform: [{ rotate: '12deg' }],
  },
  heroTitle: {
    flex: 1,
    fontSize: 28,
    lineHeight: 33,
    letterSpacing: -0.8,
    fontWeight: '600',
    color: Palette.white,
  },
  heroCopy: { color: Palette.white, fontSize: 14, lineHeight: 22 },
  heroHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 4,
  },
  heroBadgeText: { color: Palette.white, fontWeight: '600' },
  heroField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Palette.white,
    borderRadius: 999,
    paddingLeft: 18,
    paddingRight: 6,
    minHeight: 52,
    marginTop: 4,
  },
  heroFieldPlaceholder: { flex: 1, color: Palette.midGrey },
  heroSend: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { gap: 16 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  shortcuts: { flexDirection: 'row', gap: 12 },
  stacked: { flexDirection: 'column' },
  shortcut: { flex: 1, gap: 10, alignItems: 'center', minHeight: 86 },
  shortcutLarge: { flexDirection: 'row', minHeight: 56 },
  shortcutIcon: {
    width: 58,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: { textAlign: 'center', fontWeight: '600', flexShrink: 1 },
  textLink: { minHeight: 48, justifyContent: 'center' },
  overdue: { minHeight: 48, justifyContent: 'center' },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 22,
  },
  emptyCopy: { marginTop: 6, lineHeight: 20 },
  assistant: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 88,
    padding: Spacing.four,
    borderRadius: 22,
    borderWidth: 1,
  },
  assistantIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
});
