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
          <View style={[styles.hero, { backgroundColor: theme.primary }]}>
            <View
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={styles.heroDecoration}
            >
              <Ionicons
                name="calendar-outline"
                size={86}
                color={Palette.white}
              />
            </View>
            <ThemedText style={styles.heroTitle}>
              Un peu d’ordre.{'\n'}L’esprit plus léger.
            </ThemedText>
            <ThemedText style={styles.heroCopy}>
              Vos rendez-vous et vos dates importantes, au même endroit.
            </ThemedText>
            <Pressable
              onPress={() => router.push('/planificateur')}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.heroButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <ThemedText type="label" style={styles.heroButtonText}>
                Organiser mon quotidien
              </ThemedText>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={Palette.deepBluePressed}
              />
            </Pressable>
          </View>
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
          <Pressable
            onPress={() => router.push('/demarche')}
            accessibilityRole="button"
            accessibilityLabel="Découvrir l’assistant, bientôt disponible"
            style={({ pressed }) => [
              styles.assistant,
              { borderColor: theme.cardBorder, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Ionicons
              name="chatbubbles-outline"
              size={24}
              color={theme.turquoiseTintText}
            />
            <View style={styles.flex}>
              <ThemedText type="label">À vos côtés, bientôt.</ThemedText>
              <ThemedText type="caption" themeColor="textSecondary">
                Votre assistant administratif se prépare.
              </ThemedText>
            </View>
            <Ionicons
              name="chevron-forward"
              size={17}
              color={theme.textSecondary}
            />
          </Pressable>
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
    fontSize: 28,
    lineHeight: 33,
    letterSpacing: -0.8,
    fontWeight: '600',
    color: Palette.white,
  },
  heroCopy: { color: Palette.white, fontSize: 14, lineHeight: 22 },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: Palette.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    padding: 13,
    borderRadius: 14,
    marginTop: 4,
  },
  heroButtonText: { color: Palette.deepBluePressed, flexShrink: 1 },
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
    borderTopWidth: 1,
    paddingTop: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 72,
  },
});
