import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type PrimaryButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  children: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

/** CTA principal pleine largeur, fond `primary` (pattern "Continuer" de la charte mobile §03). */
export function PrimaryButton({
  onPress,
  children,
  icon = 'arrow-forward',
  disabled = false,
}: PrimaryButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ disabled }}
      accessibilityRole="button"
      accessibilityLabel={children}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.button,
            { opacity: disabled ? 0.5 : 1 },
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
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: 10,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  label: {
    flexShrink: 1,
    textAlign: 'center',
    color: '#FFFFFF',
  },
});
