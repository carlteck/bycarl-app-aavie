import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Alert, AppState, Linking, Platform, Pressable } from 'react-native';

import { requestDictationPermission } from '@/lib/dictation-permission';
import { Palette } from '@/constants/theme';

/**
 * ⚠️ Chargement protégé, comme pour `expo-speech`.
 *
 * Le module s'initialise à l'import et LÈVE dans un binaire qui ne le contient pas : un client
 * de développement antérieur à son ajout, ou une mise à jour OTA livrée à des binaires plus
 * anciens. Sans ce filet, l'écran d'accueil entier disparaîtrait derrière un message parlant
 * de `default export`.
 */
type RecognitionModule = typeof import('expo-speech-recognition');

let recognition: RecognitionModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  recognition = require('expo-speech-recognition') as RecognitionModule;
} catch {
  recognition = null;
}

/** L'appelant en a besoin pour décider d'afficher, ou non, l'avertissement de confidentialité. */
export const isDictationAvailable = recognition !== null;

type Props = {
  /** Reçoit le texte reconnu, à concaténer à la saisie en cours. */
  onTranscript: (text: string) => void;
  /** Message d'échec, affiché par l'appelant : lui seul sait où le poser. */
  onError: (message: string) => void;
  color?: string;
};

/**
 * Bouton de dictée : remplit un champ à la voix.
 *
 * ⚠️ Contrairement à la lecture à voix haute, la dictée n'est pas locale par défaut. Sur
 * Android elle passe par le service de Google ; sur iOS elle peut rester sur l'appareil, mais
 * seulement si le modèle de la langue y est installé. La voix de l'usager peut donc quitter son
 * téléphone — une question à l'assistant contenant des informations administratives, l'interface
 * doit le dire, comme le site le fait.
 */
export function DictationButton(props: Props) {
  // `recognition` ne change pas pendant la vie de l'application : cette sortie anticipée est
  // stable, et elle évite d'appeler les hooks du module quand il est absent.
  if (!recognition) return null;
  return <DictationButtonInner {...props} />;
}

function DictationButtonInner({ onTranscript, onError, color }: Props) {
  const module = recognition!;
  const [listening, setListening] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const lifecycle = useRef({
    active: false,
    generation: 0,
    busy: false,
    listening: false,
  });
  useFocusEffect(
    useCallback(() => {
      const life = lifecycle.current;
      life.active = true;
      setListening(false);
      const cancel = () => {
        life.generation++;
        life.listening = false;
        try {
          module.ExpoSpeechRecognitionModule.abort();
        } catch {
          /* Le service peut déjà être arrêté. */
        }
      };
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'background') {
          cancel();
          setListening(false);
        }
      });
      return () => {
        life.active = false;
        cancel();
        subscription.remove();
      };
    }, [module]),
  );

  module.useSpeechRecognitionEvent('result', (event) => {
    const text = event.results?.[0]?.transcript?.trim();
    if (text && lifecycle.current.active && lifecycle.current.listening)
      onTranscript(text);
  });
  module.useSpeechRecognitionEvent('end', () => {
    lifecycle.current.listening = false;
    if (lifecycle.current.active) setListening(false);
  });
  module.useSpeechRecognitionEvent('error', (event) => {
    if (!lifecycle.current.active || !lifecycle.current.listening) return;
    lifecycle.current.listening = false;
    setListening(false);
    onError(messageFor(event.error));
  });

  const toggle = useCallback(() => {
    const life = lifecycle.current;
    if (!life.active || life.busy) return;
    if (life.listening) {
      try {
        module.ExpoSpeechRecognitionModule.stop();
      } catch {
        life.listening = false;
        onError('La dictée n’a pas pu s’arrêter normalement.');
      }
      setListening(false);
      return;
    }
    life.busy = true;
    setRequesting(true);
    const generation = life.generation;
    const current = () => life.active && generation === life.generation;
    void (async () => {
      try {
        const permission = await requestDictationPermission(
          module.ExpoSpeechRecognitionModule,
          current,
        );
        if (!current() || permission === 'cancelled') return;
        if (permission !== 'granted') {
          const message =
            permission === 'blocked'
              ? 'Autorisez le micro et, sur iPhone, la reconnaissance vocale dans les réglages pour utiliser la dictée.'
              : 'La dictée a besoin de votre autorisation. Vous pouvez réessayer ou écrire votre question.';
          onError(message);
          if (permission === 'blocked' && Platform.OS !== 'web') {
            Alert.alert('Autoriser la dictée', message, [
              { text: 'Plus tard', style: 'cancel' },
              {
                text: 'Ouvrir les réglages',
                onPress: () => {
                  if (!current()) return;
                  void Linking.openSettings().catch(() => {
                    if (current())
                      onError(
                        'Ouvrez les réglages du téléphone, puis les autorisations d’AAVIE.',
                      );
                  });
                },
              },
            ]);
          }
          return;
        }
        life.listening = true;
        setListening(true);
        module.ExpoSpeechRecognitionModule.start({
          lang: 'fr-FR',
          interimResults: false,
          continuous: false,
        });
      } catch {
        if (current()) {
          life.listening = false;
          setListening(false);
          onError(
            'La dictée n’a pas fonctionné. Vous pouvez écrire votre question.',
          );
        }
      } finally {
        life.busy = false;
        if (life.active) setRequesting(false);
      }
    })();
  }, [module, onError]);

  return (
    <Pressable
      onPress={toggle}
      disabled={requesting}
      accessibilityState={{ disabled: requesting, busy: requesting }}
      accessibilityRole="button"
      accessibilityLabel={
        listening ? 'Arrêter la dictée' : 'Dicter la question'
      }
      hitSlop={8}
    >
      <Ionicons
        name={listening ? 'stop-circle' : 'mic-outline'}
        size={20}
        color={listening ? Palette.coral : (color ?? Palette.midGrey)}
      />
    </Pressable>
  );
}

/** Les codes bruts ne disent rien à l'usager ; chacun appelle une réponse différente. */
function messageFor(code: string | undefined): string {
  if (code === 'not-allowed' || code === 'service-not-allowed')
    return 'Le micro n’est pas autorisé. Ouvrez les réglages de votre téléphone pour l’activer.';
  if (code === 'no-speech')
    return 'Aucune voix entendue. Réessayez en parlant plus près du micro.';
  if (code === 'network')
    return 'La reconnaissance vocale a besoin d’une connexion pour fonctionner.';
  if (code === 'language-not-supported')
    return 'La dictée n’est pas disponible dans cette langue sur cet appareil.';
  return 'La dictée n’a pas fonctionné. Vous pouvez écrire votre question.';
}
