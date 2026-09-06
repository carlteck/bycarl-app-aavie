import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModuleCard } from '@/components/module-card';
import { PageHeader } from '@/components/page-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SERVICE_GROUPS } from '@/constants/modules';

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ThemedView style={styles.screen}>
      <PageHeader
        icon="grid-outline"
        title="Vos services"
        intro="Le bon outil, au bon moment."
      />
      <ScrollView
        contentContainerStyle={{
          paddingLeft: insets.left + 24,
          paddingRight: insets.right + 24,
          paddingBottom: insets.bottom + 32,
        }}
      >
        <View style={styles.content}>
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
