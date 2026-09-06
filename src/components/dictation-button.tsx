import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { Pressable } from 'react-native';

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

  module.useSpeechRecognitionEvent('result', (event) => {
    const text = event.results?.[0]?.transcript?.trim();
    if (text) onTranscript(text);
  });
  module.useSpeechRecognitionEvent('end', () => setListening(false));
  module.useSpeechRecognitionEvent('error', (event) => {
    setListening(false);
    onError(messageFor(event.error));
  });

  // La reconnaissance doit s'arrêter en quittant l'écran : sinon le micro reste ouvert,
  // sans plus aucun bouton pour le refermer.
  useEffect(() => () => module.ExpoSpeechRecognitionModule.abort(), [module]);

  const toggle = useCallback(() => {
    if (listening) {
      module.ExpoSpeechRecognitionModule.stop();
      setListening(false);
      return;
    }

    void (async () => {
      // Demandée explicitement, pour la même raison que sur le site : sans ça, un refus passé
      // fait échouer les tentatives suivantes sans que rien ne soit redemandé.
      const permission =
        await module.ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        onError(
          'Le micro n’est pas autorisé. Ouvrez les réglages de votre téléphone pour l’activer.',
        );
        return;
      }

      setListening(true);
      module.ExpoSpeechRecognitionModule.start({
        // Aucun service ne reconnaît le créole guyanais : le français est la langue dans
        // laquelle les démarches sont formulées de toute façon.
        lang: 'fr-FR',
        interimResults: false,
        continuous: false,
      });
    })();
  }, [listening, module, onError]);

  return (
    <Pressable
      onPress={toggle}
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
