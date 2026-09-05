import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeaderBar } from '@/components/screen-header-bar';
import { ModuleCard } from '@/components/module-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SERVICE_GROUPS } from '@/constants/modules';

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ThemedView style={styles.screen}>
      <ScreenHeaderBar
        title="Vos services"
        onBack={() => router.back()}
        backLabel="Mon espace"
      />
      <ScrollView
        contentContainerStyle={{
          paddingLeft: insets.left + 24,
          paddingRight: insets.right + 24,
          paddingBottom: insets.bottom + 32,
        }}
      >
        <View style={styles.content}>
          <ThemedText themeColor="textSecondary">
            Le bon outil, au bon moment.
          </ThemedText>
          {SERVICE_GROUPS.map((group) => (
            <View key={group.title} style={styles.group}>
              <ThemedText type="sectionTitle" accessibilityRole="header">
                {group.title}
              </ThemedText>
              {group.modules.map((module) => (
                <ModuleCard key={module.id} {...module} />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    gap: 28,
    paddingTop: 12,
  },
  group: { gap: 12 },
});
