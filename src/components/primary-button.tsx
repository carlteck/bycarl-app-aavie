import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type PrimaryButtonProps = {
  onPress: () => void;
  children: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

/** CTA principal pleine largeur, fond `primary` (pattern "Continuer" de la charte mobile §03). */
export function PrimaryButton({
  onPress,
  children,
  icon = 'arrow-forward',
}: PrimaryButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={children}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.button,
            { backgroundColor: pressed ? theme.primaryPressed : theme.primary },
          ]}
        >
          <ThemedText type="label" style={styles.label}>
            {children}
          </ThemedText>
          <Ionicons name={icon} size={16} color="#FFFFFF" />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  label: {
    color: '#FFFFFF',
  },
});
