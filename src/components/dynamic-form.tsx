import { StyleSheet, View } from 'react-native';

import { FormField } from './form-field';

import type { ProcedureField } from '@/constants/procedures';
import { Spacing } from '@/constants/theme';

type DynamicFormProps = {
  fields: ProcedureField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  /** Clés dont la valeur a été injectée automatiquement depuis le profil (affichage du badge). */
  prefilledKeys?: Set<string>;
};

/** Formulaire généré depuis une définition de démarche (`constants/procedures.ts`). */
export function DynamicForm({ fields, values, onChange, prefilledKeys }: DynamicFormProps) {
  return (
    <View style={styles.container}>
      {fields.map((field) => (
        <FormField
          key={field.key}
          field={field}
          value={values[field.key] ?? ''}
          onChange={(value) => onChange(field.key, value)}
          prefilled={prefilledKeys?.has(field.key)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
});
