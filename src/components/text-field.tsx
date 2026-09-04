import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TextFieldProps = TextInputProps & {
  label: string;
  /** Ajoute l'œil de bascule et masque la saisie par défaut. */
  secure?: boolean;
};

/** Champ de saisie étiqueté, utilisé par la connexion et l'inscription. */
export function TextField({ label, secure, style, ...rest }: TextFieldProps) {
  const theme = useTheme();
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.field}>
      <ThemedText type="label">{label}</ThemedText>
      <View style={styles.inputRow}>
        <TextInput
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={secure && !revealed}
          style={[
            styles.input,
            { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.background },
            secure ? styles.inputWithAction : null,
            style,
          ]}
          {...rest}
        />
        {secure && (
          <Pressable
            onPress={() => setRevealed((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.action}>
            <Ionicons
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.textSecondary}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.one,
  },
  inputRow: {
    justifyContent: 'center',
  },
  input: {
    minHeight: 48,
    fontSize: 16,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.three,
  },
  inputWithAction: {
    paddingRight: Spacing.six,
  },
  action: {
    position: 'absolute',
    right: Spacing.three,
  },
});
