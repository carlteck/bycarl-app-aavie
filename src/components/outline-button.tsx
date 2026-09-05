import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
} from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Palette, Spacing } from '@/constants/theme';

type OutlineButtonProps = {
  children: ReactNode;
  onPress: (event: GestureResponderEvent) => void;
  accessibilityLabel?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

/**
 * Bouton secondaire "contour" (pattern "Plus tard" de la charte mobile §03) : à utiliser pour
 * une action secondaire à côté d'une action principale pleine (`primary`), jamais seul comme
 * CTA principal.
 */
export function OutlineButton({
  children,
  onPress,
  accessibilityLabel,
  icon,
}: OutlineButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {({ pressed }) => (
        <ThemedView
          type={pressed ? 'backgroundSelected' : 'background'}
          style={styles.button}
        >
          <View style={styles.content}>
            {icon && (
              <Ionicons name={icon} size={15} color={Palette.deepBlue} />
            )}
            <ThemedText type="label" themeColor="primary" numberOfLines={1}>
              {children}
            </ThemedText>
          </View>
        </ThemedView>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
    borderWidth: 1.5,
    borderColor: Palette.deepBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
