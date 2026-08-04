import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import type { ProcedureField } from '@/constants/procedures';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FormFieldProps = {
  field: ProcedureField;
  value: string;
  onChange: (value: string) => void;
  /** Vrai si la valeur actuelle provient du pré-remplissage automatique depuis le profil. */
  prefilled?: boolean;
};

const KEYBOARD_TYPE: Partial<Record<ProcedureField['type'], 'default' | 'phone-pad' | 'email-address'>> = {
  tel: 'phone-pad',
  email: 'email-address',
};

/** Champ générique piloté par la définition de démarche (`DynamicForm`) : texte, date, select... */
export function FormField({ field, value, onChange, prefilled }: FormFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <ThemedText type="label">
          {field.label}
          {field.required && <ThemedText themeColor="accent"> *</ThemedText>}
        </ThemedText>
        {prefilled && value.length > 0 && (
          <View style={styles.prefillBadge}>
            <Ionicons name="sparkles-outline" size={11} color={theme.turquoiseTintText} />
            <ThemedText type="caption" style={{ color: theme.turquoiseTintText }}>
              Pré-rempli
            </ThemedText>
          </View>
        )}
      </View>

      {field.type === 'select' && field.options ? (
        <View style={styles.optionsRow}>
          {field.options.map((option) => {
            const selected = option === value;
            return (
              <Pressable
                key={option}
                onPress={() => onChange(option)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
                <ThemedView
                  type={selected ? 'turquoise' : 'backgroundElement'}
                  style={styles.optionChip}>
                  <ThemedText
                    type="label"
                    style={{ color: selected ? theme.turquoiseTintText : theme.textSecondary }}>
                    {option}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={field.placeholder ?? field.label}
          placeholderTextColor={theme.textSecondary}
          keyboardType={KEYBOARD_TYPE[field.type] ?? 'default'}
          autoCapitalize={field.type === 'email' ? 'none' : 'sentences'}
          accessibilityLabel={field.label}
          style={[
            styles.input,
            { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.cardBorder },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  prefillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  input: {
    minHeight: 44,
    borderRadius: Spacing.two,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  optionChip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
});
