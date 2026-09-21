import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { OutlineButton } from './outline-button';
import { PrimaryButton } from './primary-button';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { CardShadow, Spacing } from '@/constants/theme';
import type { BudgetInput } from '@/hooks/use-budget';
import { useTheme } from '@/hooks/use-theme';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  KIND_LABEL,
  LABEL_MAX,
  parseAmountToCents,
  type BudgetEntry,
  type BudgetKind,
} from '@/lib/budget';
import {
  formatDateDigits,
  isoToDigits,
  parseDateDigits,
  todayISO,
} from '@/lib/reminder-date';

type Props = {
  initialValue?: BudgetEntry;
  onSubmit: (input: BudgetInput) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
};

const centsToInput = (cents: number) =>
  `${Math.floor(cents / 100)},${String(cents % 100).padStart(2, '0')}`;

export function BudgetEntryForm({
  initialValue,
  onSubmit,
  onCancel,
  onDelete,
}: Props) {
  const theme = useTheme();
  const [kind, setKind] = useState<BudgetKind>(initialValue?.kind ?? 'expense');
  const [label, setLabel] = useState(initialValue?.label ?? '');
  const [amount, setAmount] = useState(
    initialValue ? centsToInput(initialValue.amountCents) : '',
  );
  const [dateDigits, setDateDigits] = useState(
    isoToDigits(initialValue?.dateISO ?? todayISO()),
  );
  const [category, setCategory] = useState(initialValue?.category ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Une catégorie venue du site (texte libre) reste proposée en modification : sinon l'enregistrer
  // la remplacerait sans que l'usager l'ait choisi.
  const presets: readonly string[] =
    kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const options =
    initialValue &&
    initialValue.kind === kind &&
    !presets.includes(initialValue.category)
      ? [...presets, initialValue.category]
      : presets;

  const changeKind = (next: BudgetKind) => {
    if (next === kind) return;
    setKind(next);
    setCategory('');
  };

  const submit = async () => {
    if (saving) return;
    const cents = parseAmountToCents(amount);
    const dateISO = parseDateDigits(dateDigits);
    if (label.trim().length === 0)
      return setError('Donnez un nom à cette opération.');
    if (cents === null)
      return setError('Entrez un montant supérieur à 0, par exemple 12,50.');
    if (!dateISO)
      return setError('Entrez une date valide au format JJ/MM/AAAA.');
    if (!category) return setError('Choisissez une catégorie.');
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        kind,
        label: label.trim(),
        amountCents: cents,
        dateISO,
        category,
      });
    } catch {
      setError(
        'L’opération n’a pas pu être enregistrée sur cet appareil. Réessayez.',
      );
      setSaving(false);
    }
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElement, color: theme.text },
  ];

  return (
    <ThemedView
      type="background"
      style={[styles.card, CardShadow, { borderColor: theme.cardBorder }]}
    >
      <View style={styles.field} accessibilityRole="radiogroup">
        <ThemedText type="label">Type d’opération</ThemedText>
        <View style={styles.row}>
          {(['expense', 'income'] as const).map((item) => {
            const selected = item === kind;
            return (
              <Pressable
                key={item}
                onPress={() => changeKind(item)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={styles.flex}
              >
                <ThemedView
                  type={selected ? 'turquoiseTint' : 'backgroundElement'}
                  style={styles.kind}
                >
                  <ThemedText
                    type="label"
                    themeColor={
                      selected ? 'turquoiseTintText' : 'textSecondary'
                    }
                  >
                    {KIND_LABEL[item]}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.field}>
        <ThemedText type="label">Nom</ThemedText>
        <TextInput
          value={label}
          onChangeText={setLabel}
          maxLength={LABEL_MAX}
          placeholder={
            kind === 'income' ? 'Ex : allocation logement' : 'Ex : loyer'
          }
          placeholderTextColor={theme.textSecondary}
          accessibilityLabel="Nom de l’opération"
          style={inputStyle}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="label">Montant en euros</ThemedText>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          maxLength={12}
          placeholder="0,00"
          placeholderTextColor={theme.textSecondary}
          accessibilityLabel="Montant en euros"
          style={inputStyle}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="label">Date</ThemedText>
        <TextInput
          value={formatDateDigits(dateDigits)}
          onChangeText={(text) =>
            setDateDigits(text.replace(/\D/g, '').slice(0, 8))
          }
          keyboardType="number-pad"
          maxLength={10}
          placeholder="JJ/MM/AAAA"
          placeholderTextColor={theme.textSecondary}
          accessibilityLabel="Date de l’opération, format jour mois année"
          style={inputStyle}
        />
      </View>

      <View style={styles.field} accessibilityRole="radiogroup">
        <ThemedText type="label">Catégorie</ThemedText>
        <View style={[styles.row, styles.wrap]}>
          {options.map((item) => {
            const selected = item === category;
            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={styles.chipHit}
              >
                <ThemedView
                  type={selected ? 'turquoiseTint' : 'backgroundElement'}
                  style={styles.chip}
                >
                  <ThemedText
                    type="label"
                    themeColor={
                      selected ? 'turquoiseTintText' : 'textSecondary'
                    }
                  >
                    {item}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            );
          })}
        </View>
      </View>

      {error ? (
        <ThemedText
          type="caption"
          themeColor="accent"
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          {error}
        </ThemedText>
      ) : null}

      <View style={styles.actions}>
        <PrimaryButton
          icon="checkmark"
          disabled={saving}
          onPress={() => void submit()}
        >
          Enregistrer
        </PrimaryButton>
        <OutlineButton onPress={onCancel}>Annuler</OutlineButton>
      </View>

      {onDelete ? (
        <Pressable
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel="Supprimer cette opération"
          style={styles.delete}
        >
          <ThemedText type="label" themeColor="accent">
            Supprimer cette opération
          </ThemedText>
        </Pressable>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  field: { gap: Spacing.one },
  row: { flexDirection: 'row', gap: Spacing.two },
  wrap: { flexWrap: 'wrap' },
  flex: { flex: 1 },
  input: {
    minHeight: 48,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  kind: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two,
  },
  chipHit: { minHeight: 48, justifyContent: 'center' },
  chip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  delete: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
});
