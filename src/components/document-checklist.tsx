import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import type { ProcedureDocument } from '@/constants/procedures';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type DocumentChecklistProps = {
  documents: ProcedureDocument[];
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
};

/**
 * Liste des pièces justificatives requises pour une démarche, à cocher au fur et à mesure.
 * Volontairement simple pour la démo (pas d'upload réel) : l'objectif est d'aider l'utilisateur
 * à vérifier qu'il a tout avant de se déplacer ou d'envoyer son dossier.
 */
export function DocumentChecklist({
  documents,
  checked,
  onToggle,
}: DocumentChecklistProps) {
  const theme = useTheme();

  return (
    <View style={styles.list}>
      {documents.map((document) => {
        const isChecked = checked[document.id] ?? false;
        return (
          <Pressable
            key={document.id}
            onPress={() => onToggle(document.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isChecked }}
            accessibilityLabel={document.label}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <ThemedView
              type="background"
              style={[
                styles.row,
                { borderColor: isChecked ? theme.primary : theme.cardBorder },
              ]}
            >
              <ThemedView
                type={isChecked ? 'primary' : 'backgroundElement'}
                style={styles.checkbox}
              >
                {isChecked && (
                  <Ionicons name="checkmark" size={15} color="#FFFFFF" />
                )}
              </ThemedView>
              <ThemedText style={styles.label}>{document.label}</ThemedText>
            </ThemedView>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 44,
    padding: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  label: {
    flex: 1,
  },
});
