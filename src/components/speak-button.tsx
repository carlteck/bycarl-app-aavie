import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Bouton « Écouter » : lit un texte à voix haute avec la voix du système.
 *
 * Une partie du public d'AAVIE est en difficulté avec l'écrit. Pouvoir écouter la liste des
 * pièces à réunir plutôt que la déchiffrer n'est pas un confort, c'est une condition d'accès —
 * le cahier des charges en fait une exigence transverse, pas une option.
 *
 * `expo-speech` utilise les voix installées sur l'appareil : rien ne part sur le réseau, rien
 * n'est facturé, et ça fonctionne hors connexion. C'est la différence avec la dictée, qui elle
 * dépend d'un service distant.
 */
export function SpeakButton({
  text,
  accessibilityLabel = 'Écouter ce texte',
}: {
  text: string;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  const [speaking, setSpeaking] = useState(false);
  const [failed, setFailed] = useState(false);

  // La voix doit s'arrêter quand on quitte l'écran : sans ça elle poursuit sa lecture
  // par-dessus l'écran suivant, sans aucun bouton pour la faire taire.
  useEffect(() => () => void Speech.stop(), []);

  const toggle = useCallback(() => {
    if (speaking) {
      void Speech.stop();
      setSpeaking(false);
      return;
    }

    setFailed(false);
    setSpeaking(true);
    Speech.speak(text, {
      language: 'fr-FR',
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      // Un appareil sans moteur de synthèse installé échoue ici. Le dire vaut mieux qu'un
      // bouton qui ne fait rien : l'usager saurait au moins que ce n'est pas lui.
      onError: () => {
        setSpeaking(false);
        setFailed(true);
      },
    });
  }, [speaking, text]);

  return (
    <>
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={
          speaking ? 'Arrêter la lecture' : accessibilityLabel
        }
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: theme.turquoiseTint,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Ionicons
          name={speaking ? 'stop-circle-outline' : 'volume-high-outline'}
          size={18}
          color={theme.turquoiseTintText}
        />
        <ThemedText type="label" themeColor="turquoiseTintText">
          {speaking ? 'Arrêter' : 'Écouter'}
        </ThemedText>
      </Pressable>
      {failed && (
        <ThemedText type="caption" themeColor="textSecondary">
          La lecture à voix haute n’est pas disponible sur cet appareil.
        </ThemedText>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
  },
});
