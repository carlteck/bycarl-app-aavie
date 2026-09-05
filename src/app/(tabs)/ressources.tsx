import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { SectionScreen } from '@/components/section-screen';
import { ThemedText } from '@/components/themed-text';
import { AAVIE_SECTIONS } from '@/constants/modules';
import { useTheme } from '@/hooks/use-theme';

export default function RessourcesScreen() {
  const theme = useTheme();
  return (
    <SectionScreen
      section={{
        ...AAVIE_SECTIONS[1],
        heading: 'Des repères clairs.',
        intro: 'Pour mieux comprendre, puis avancer.',
      }}
      beforeModules={
        <View
          style={[styles.feature, { backgroundColor: theme.turquoiseTint }]}
        >
          <View style={[styles.book, { backgroundColor: theme.background }]}>
            <Ionicons
              name="book-outline"
              size={38}
              color={theme.turquoiseTintText}
            />
          </View>
          <ThemedText
            type="caption"
            themeColor="turquoiseTintText"
            style={styles.eyebrow}
          >
            EN PRÉPARATION
          </ThemedText>
          <ThemedText style={styles.title}>
            L’administration,{'\n'}avec des mots simples.
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            Des guides et des explications pour vos démarches. Les premières
            ressources seront proposées ici.
          </ThemedText>
        </View>
      }
    />
  );
}
const styles = StyleSheet.create({
  feature: { padding: 24, borderRadius: 26, gap: 16, marginBottom: 12 },
  book: {
    width: 72,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-7deg' }],
    marginBottom: 8,
  },
  eyebrow: { letterSpacing: 1.2, fontWeight: '600' },
  title: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '600',
    letterSpacing: -0.7,
  },
});
