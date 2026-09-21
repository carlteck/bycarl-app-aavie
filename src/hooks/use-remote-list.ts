import { useCallback, useEffect, useRef, useState } from 'react';

import {
  classifyRemoteError,
  REQUEST_TIMEOUT_MS,
  type RemoteErrorKind,
} from '@/lib/remote-error';

export type PageResult<T> = { items: T[]; hasMore: boolean };
export type PageFetcher<T> = (
  page: number,
  signal: AbortSignal,
) => Promise<PageResult<T>>;

type Data<T> = {
  /** `error` seulement tant qu'il n'y a rien à montrer ; sinon la liste reste affichée. */
  status: 'loading' | 'ready' | 'error';
  items: T[];
  page: number;
  hasMore: boolean;
  error: RemoteErrorKind | null;
  refreshing: boolean;
  loadingMore: boolean;
};

const LOADING: Data<never> = {
  status: 'loading',
  items: [],
  page: 0,
  hasMore: false,
  error: null,
  refreshing: false,
  loadingMore: false,
};

/**
 * Liste distante paginée : chargement initial, tirer-pour-rafraîchir, pagination à la demande.
 *
 * `fetchPage` doit être mémoïsé (`useCallback`) sur les seuls critères de requête. L'état porte le
 * `fetchPage` qui l'a produit : dès que les critères changent, l'affichage repasse en chargement
 * SANS réinitialiser d'état dans un effet (on lit simplement un état d'un autre critère comme
 * « pas encore chargé »). Une réponse tardive d'une requête abandonnée est ignorée (numéro de
 * passage) et le démontage annule l'appel réseau. `keyOf` (référence stable) écarte les doublons
 * quand une ligne bouge entre deux pages.
 */
export function useRemoteList<T>(
  fetchPage: PageFetcher<T>,
  keyOf: (item: T) => string,
) {
  const [state, setState] = useState<Data<T> & { owner: unknown }>({
    ...LOADING,
    owner: null,
  });
  const controller = useRef<AbortController | null>(null);
  const pass = useRef(0);

  const run = useCallback(
    async (mode: 'reset' | 'refresh' | 'more', page: number) => {
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
        const result = await fetchPage(page, own.signal);
        if (own.signal.aborted || id !== pass.current) return;
        setState((prev) => {
          const base =
            mode === 'more' && prev.owner === fetchPage ? prev.items : [];
          const seen = new Set(base.map(keyOf));
          return {
            owner: fetchPage,
            status: 'ready',
            items: [
              ...base,
              ...result.items.filter((item) => !seen.has(keyOf(item))),
            ],
            page,
            hasMore: result.hasMore,
            error: null,
            refreshing: false,
            loadingMore: false,
          };
        });
      } catch (error) {
        // Annulé par un nouveau passage ou le démontage : rien à afficher. Annulé par le délai :
        // c'est une panne de réseau, à dire à l'usager.
        if (id !== pass.current || (own.signal.aborted && !timedOut)) return;
        const kind = timedOut ? 'network' : classifyRemoteError(error);
        setState((prev) => {
          const items = prev.owner === fetchPage ? prev.items : [];
          return {
            ...(prev.owner === fetchPage ? prev : LOADING),
            owner: fetchPage,
            status: items.length > 0 ? 'ready' : 'error',
            error: kind,
            refreshing: false,
            loadingMore: false,
          };
        });
      } finally {
        clearTimeout(timer);
      }
    },
    [fetchPage, keyOf],
  );

  useEffect(() => {
    // Différé d'un tour : le premier chargement est un abonnement à une source externe (le
    // réseau), pas une synchronisation d'état ; il ne doit pas écrire d'état pendant l'effet.
    const start = setTimeout(() => void run('reset', 0), 0);
    return () => {
      clearTimeout(start);
      pass.current += 1;
      controller.current?.abort();
    };
  }, [run]);

  const view: Data<T> = state.owner === fetchPage ? state : LOADING;
  const { status, page, hasMore, loadingMore, refreshing } = view;

  const loadMore = useCallback(() => {
    if (status !== 'ready' || !hasMore || loadingMore || refreshing) return;
    setState((prev) => ({ ...prev, loadingMore: true, error: null }));
    void run('more', page + 1);
  }, [status, hasMore, loadingMore, refreshing, page, run]);

  const refresh = useCallback(() => {
    setState((prev) =>
      prev.owner === fetchPage
        ? { ...prev, refreshing: true, error: null }
        : prev,
    );
    void run('refresh', 0);
  }, [fetchPage, run]);

  const retry = useCallback(() => {
    setState({ ...LOADING, owner: fetchPage });
    void run('reset', 0);
  }, [fetchPage, run]);

  return { ...view, loadMore, refresh, retry };
}
