import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  /** Nom lu par VoiceOver/TalkBack ; le placeholder disparaît à la saisie. */
  label: string;
};

export function SearchField({
  value,
  onChangeText,
  placeholder,
  label,
}: Props) {
  const theme = useTheme();
  return (
    <View
      style={[styles.bar, { backgroundColor: theme.backgroundElement }]}
      accessibilityRole="search"
    >
      <Ionicons name="search-outline" size={18} color={theme.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel={label}
        style={[styles.input, { color: theme.text }]}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Effacer la recherche"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.clear}
        >
          <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 14,
    paddingLeft: Spacing.three,
  },
  input: { flex: 1, minHeight: 48, fontSize: 16 },
  clear: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
