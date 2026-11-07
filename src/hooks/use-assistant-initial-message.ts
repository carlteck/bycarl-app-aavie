import { useEffect, useRef } from 'react';

/** L'envoi depuis l'accueil est déjà confirmé ; l'ouverture du fil doit le poursuivre. */
export function useAssistantInitialMessage(
  message: string,
  conversationId: string | null,
  send: (message: string) => Promise<void>,
) {
  const initial = useRef(conversationId ? '' : message);
  const started = useRef(false);

  useEffect(() => {
    if (!initial.current || conversationId || started.current) return;
    // Le nettoyage annule le premier démarrage de Strict Mode avant tout appel réseau.
    const timer = setTimeout(() => {
      if (started.current) return;
      started.current = true;
      void send(initial.current);
    }, 0);
    return () => clearTimeout(timer);
  }, [conversationId, send]);
}
