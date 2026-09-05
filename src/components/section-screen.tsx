import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PageHeader } from './page-header';
import { ModuleCard } from './module-card';
import { ThemedView } from './themed-view';
import type { AavieSection } from '@/constants/modules';
import { BottomTabInset, Spacing } from '@/constants/theme';

type SectionScreenProps = {
  section: AavieSection;
  showAppTitle?: boolean;
  beforeModules?: ReactNode;
};
export function SectionScreen({
  section,
  showAppTitle,
  beforeModules,
}: SectionScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <ThemedView type="background" style={styles.screen}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + BottomTabInset + Spacing.four,
        }}
      >
        <PageHeader
          icon={section.icon}
          title={section.heading}
          intro={section.intro}
          brand={showAppTitle}
        />
        <View
          style={[
            styles.content,
            {
              paddingLeft: insets.left + Spacing.four,
              paddingRight: insets.right + Spacing.four,
            },
          ]}
        >
          {beforeModules}
          {section.modules.map((module) => (
            <ModuleCard key={module.id} {...module} />
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
    maxWidth: 608,
    alignSelf: 'center',
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
});
