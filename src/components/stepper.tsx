import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type StepperProps = {
  steps: string[];
  currentIndex: number;
};

/** Barre de progression du parcours démarche : étapes numérotées, cochées une fois franchies. */
export function Stepper({ steps, currentIndex }: StepperProps) {
  const theme = useTheme();

  return (
    <View style={styles.row} accessibilityRole="progressbar">
      {steps.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <View key={step} style={styles.stepGroup}>
            <View style={styles.stepItem}>
              <ThemedView
                type={done || active ? 'primary' : 'backgroundElement'}
                style={styles.bullet}>
                {done ? (
                  <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                ) : (
                  <ThemedText
                    type="caption"
                    style={{ color: active ? '#FFFFFF' : theme.textSecondary }}>
                    {index + 1}
                  </ThemedText>
                )}
              </ThemedView>
              <ThemedText
                type="caption"
                themeColor={active ? 'primary' : 'textSecondary'}
                numberOfLines={1}
                style={styles.stepLabel}>
                {step}
              </ThemedText>
            </View>
            {index < steps.length - 1 && (
              <View style={[styles.connector, { backgroundColor: done ? theme.primary : theme.cardBorder }]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  stepItem: {
    alignItems: 'center',
    gap: Spacing.one,
    width: 64,
  },
  bullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    textAlign: 'center',
  },
  connector: {
    height: 2,
    flex: 1,
    marginTop: 11,
    marginHorizontal: -Spacing.one,
  },
});
