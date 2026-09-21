import { useCallback, useEffect, useRef, useState } from 'react';

import {
  classifyRemoteError,
  REQUEST_TIMEOUT_MS,
  type RemoteErrorKind,
} from '@/lib/remote-error';

type Data<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'ready'; data: T; error: null }
  | { status: 'missing'; data: null; error: null }
  | { status: 'error'; data: T | null; error: RemoteErrorKind };

const LOADING: Data<never> = { status: 'loading', data: null, error: null };

/**
 * Ressource distante unique (détail d'un article, solde…). `load` doit être mémoïsé ; changer
 * d'identité repasse en chargement (état lu comme « pas encore chargé », sans `setState` dans un
 * effet). Retourner `null` signifie « n'existe pas (ou plus) » : c'est un état à part de l'erreur,
 * pour ne pas proposer « Réessayer » face à un élément supprimé.
 */
export function useRemoteResource<T>(
  load: (signal: AbortSignal) => Promise<T | null>,
) {
  const [state, setState] = useState<Data<T> & { owner: unknown }>({
    ...LOADING,
    owner: null,
  });
  const controller = useRef<AbortController | null>(null);
  const pass = useRef(0);

  const run = useCallback(async () => {
    controller.current?.abort();
    const own = new AbortController();
    controller.current = own;
    const id = ++pass.current;
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      own.abort();
    }, REQUEST_TIMEOUT_MS);
    try {
      const data = await load(own.signal);
      if (own.signal.aborted || id !== pass.current) return;
      setState(
        data === null
          ? { owner: load, status: 'missing', data: null, error: null }
          : { owner: load, status: 'ready', data, error: null },
      );
    } catch (error) {
      if (id !== pass.current || (own.signal.aborted && !timedOut)) return;
      setState((prev) => ({
        owner: load,
        status: 'error',
        data: prev.owner === load ? prev.data : null,
        error: timedOut ? 'network' : classifyRemoteError(error),
      }));
    } finally {
      clearTimeout(timer);
    }
  }, [load]);

  useEffect(() => {
    const start = setTimeout(() => void run(), 0);
    return () => {
      clearTimeout(start);
      pass.current += 1;
      controller.current?.abort();
    };
  }, [run]);

  const view: Data<T> = state.owner === load ? state : LOADING;
  const reload = useCallback(() => run(), [run]);
  const retry = useCallback(() => {
    setState({ ...LOADING, owner: load });
    void run();
  }, [load, run]);
  return { ...view, reload, retry };
}
