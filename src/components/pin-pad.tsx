import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';

const PIN_LENGTH = 4;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

type PinPadProps = {
  /** Change this value to force-clear the entered digits (e.g. after an error). */
  resetKey?: number;
  onComplete: (pin: string) => void;
};

export function PinPad({ resetKey, onComplete }: PinPadProps) {
  const [pin, setPin] = useState('');

  useEffect(() => {
    setPin('');
  }, [resetKey]);

  function handleKeyPress(key: string) {
    if (key === '') return;
    if (key === 'del') {
      setPin((current) => current.slice(0, -1));
      return;
    }
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + key;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      onComplete(next);
      setPin('');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.dotsRow} accessibilityLabel={`${pin.length} sur ${PIN_LENGTH} chiffres saisis`}>
        {Array.from({ length: PIN_LENGTH }).map((_, index) => (
          <ThemedView
            key={index}
            type={index < pin.length ? 'primary' : 'turquoise'}
            style={styles.dot}
          />
        ))}
      </View>

      <View style={styles.keypad}>
        {KEYS.map((key, index) => (
          <Pressable
            key={index}
            disabled={key === ''}
            onPress={() => handleKeyPress(key)}
            accessibilityRole="button"
            accessibilityLabel={key === 'del' ? 'Effacer' : key}
            style={({ pressed }) => [styles.key, pressed && key !== '' && styles.keyPressed]}>
            {key !== '' && (
              <ThemedView type="backgroundElement" style={styles.keyInner}>
                <ThemedText style={styles.keyLabel}>{key === 'del' ? '⌫' : key}</ThemedText>
              </ThemedView>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.five,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 3 * 72,
    justifyContent: 'center',
  },
  key: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: {
    opacity: 0.6,
  },
  keyInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Glyphe de clavier numérique : hors échelle éditoriale de la charte (pas un titre de
  // contenu), on garde une taille propre à ce composant pour la lisibilité du pavé.
  keyLabel: {
    fontSize: 28,
    fontWeight: 700,
  },
});
