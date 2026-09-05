import { useState } from 'react';
import { Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';

import { OutlineButton } from './outline-button';
import { PrimaryButton } from './primary-button';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { PROCEDURE_CATEGORIES } from '@/constants/procedures';
import { LEAD_DAYS_PRESETS, type Reminder } from '@/constants/reminders';
import { CardShadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  formatDateDigits,
  isoToDigits,
  parseDateDigits,
} from '@/lib/reminder-date';

type ReminderInput = Omit<Reminder, 'id'>;

type ReminderFormProps = {
  initialValue?: Reminder;
  onSubmit: (input: ReminderInput) => void;
  onCancel: () => void;
  onDelete?: () => void;
};

/** Formulaire d'ajout/modification d'une échéance, partagé par Planificateur et Notifications. */
export function ReminderForm({
  initialValue,
  onSubmit,
  onCancel,
  onDelete,
}: ReminderFormProps) {
  const theme = useTheme();
  const [title, setTitle] = useState(initialValue?.title ?? '');
  const [dateDigits, setDateDigits] = useState(
    initialValue ? isoToDigits(initialValue.dateISO) : '',
  );
  const [dateError, setDateError] = useState(false);
  const [category, setCategory] = useState(
    initialValue?.category ?? PROCEDURE_CATEGORIES[0],
  );
  const [notifyEnabled, setNotifyEnabled] = useState(
    initialValue?.notifyEnabled ?? true,
  );
  const [leadDays, setLeadDays] = useState(
    initialValue?.leadDays ?? LEAD_DAYS_PRESETS[1].value,
  );

  const canSubmit = title.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const dateISO = parseDateDigits(dateDigits);
    if (!dateISO) {
      setDateError(true);
      return;
    }
    onSubmit({
      title: title.trim(),
      dateISO,
      category,
      notifyEnabled,
      leadDays,
    });
  };

  return (
    <ThemedView
      type="background"
      style={[styles.card, CardShadow, { borderColor: theme.cardBorder }]}
    >
      <View style={styles.field}>
        <ThemedText type="label">Titre</ThemedText>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Ex : renouveler ma carte d’identité"
          placeholderTextColor={theme.textSecondary}
          accessibilityLabel="Titre de l’échéance"
          style={[
            styles.input,
            { backgroundColor: theme.backgroundElement, color: theme.text },
          ]}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="label">Date d’échéance</ThemedText>
        <TextInput
          value={formatDateDigits(dateDigits)}
          onChangeText={(text) => {
            // Le clavier numérique n'a pas de touche « / » : on ne garde que les chiffres tapés
            // et on insère les séparateurs automatiquement (voir `formatDateDigits`).
            setDateDigits(text.replace(/\D/g, '').slice(0, 8));
            setDateError(false);
          }}
          placeholder="JJ/MM/AAAA"
          placeholderTextColor={theme.textSecondary}
          keyboardType="number-pad"
          maxLength={10}
          accessibilityLabel="Date de l’échéance, format jour mois année"
          style={[
            styles.input,
            { backgroundColor: theme.backgroundElement, color: theme.text },
            dateError && { borderWidth: 1, borderColor: theme.accent },
          ]}
        />
        {dateError && (
          <ThemedText type="caption" themeColor="accent">
            Entrez une date valide au format JJ/MM/AAAA.
          </ThemedText>
        )}
      </View>

      <View style={styles.field}>
        <ThemedText type="label">Catégorie</ThemedText>
        <View style={styles.chipRow}>
          {PROCEDURE_CATEGORIES.map((item) => {
            const selected = item === category;
            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              >
                <ThemedView
                  type={selected ? 'turquoise' : 'backgroundElement'}
                  style={styles.chip}
                >
                  <ThemedText
                    type="label"
                    style={{
                      color: selected
                        ? theme.turquoiseTintText
                        : theme.textSecondary,
                    }}
                  >
                    {item}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.switchRow}>
        <ThemedText type="label" style={styles.switchLabel}>
          Me rappeler cette échéance
        </ThemedText>
        <Switch
          value={notifyEnabled}
          onValueChange={setNotifyEnabled}
          accessibilityLabel="Activer le rappel pour cette échéance"
        />
      </View>

      {notifyEnabled && (
        <View style={styles.field}>
          <ThemedText type="label">Délai du rappel</ThemedText>
          <View style={styles.chipRow}>
            {LEAD_DAYS_PRESETS.map((preset) => {
              const selected = preset.value === leadDays;
              return (
                <Pressable
                  key={preset.value}
                  onPress={() => setLeadDays(preset.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                >
                  <ThemedView
                    type={selected ? 'turquoise' : 'backgroundElement'}
                    style={styles.chip}
                  >
                    <ThemedText
                      type="label"
                      style={{
                        color: selected
                          ? theme.turquoiseTintText
                          : theme.textSecondary,
                      }}
                    >
                      {preset.label}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.actionsRow}>
        <PrimaryButton onPress={handleSubmit} icon="checkmark">
          Enregistrer
        </PrimaryButton>
        <OutlineButton onPress={onCancel}>Annuler</OutlineButton>
      </View>

      {onDelete && (
        <Pressable
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel="Supprimer cette échéance"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.deleteRow}
        >
          <ThemedText type="label" themeColor="accent">
            Supprimer cette échéance
          </ThemedText>
        </Pressable>
      )}
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
  field: {
    gap: Spacing.one,
  },
  input: {
    minHeight: 44,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  switchLabel: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  deleteRow: {
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
});
