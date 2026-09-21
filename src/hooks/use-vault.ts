import { useCallback, useEffect, useRef, useState } from 'react';

import { useRemoteList } from '@/hooks/use-remote-list';
import {
  fetchVaultPage,
  vaultStorage,
  type TransferState,
  type VaultDocument,
  type VaultFilter,
} from '@/lib/vault';

const vaultKey = (document: VaultDocument) => document.id;

export function useVaultDocuments(category: VaultFilter, term: string) {
  const fetchPage = useCallback(
    (page: number, signal: AbortSignal) =>
      fetchVaultPage(page, category, term, signal),
    [category, term],
  );
  return useRemoteList(fetchPage, vaultKey);
}

/**
 * États de transfert par document. Les transferts en cours sont annulés au démontage : un
 * téléchargement ne doit pas se terminer sur un écran qui n'existe plus.
 */
export function useVaultTransfers() {
  const [transfers, setTransfers] = useState<Record<string, TransferState>>({});
  const controllers = useRef(new Map<string, AbortController>());

  useEffect(() => {
    const active = controllers.current;
    return () => {
      for (const controller of active.values()) controller.abort();
      active.clear();
    };
  }, []);

  const set = useCallback((id: string, state: TransferState) => {
    setTransfers((prev) => ({ ...prev, [id]: state }));
  }, []);

  const download = useCallback(
    async (document: VaultDocument) => {
      if (controllers.current.has(document.id)) return;
      const controller = new AbortController();
      controllers.current.set(document.id, controller);
      set(document.id, { kind: 'downloading' });
      try {
        await vaultStorage.download(document, controller.signal, (progress) =>
          set(document.id, { kind: 'downloading', progress }),
        );
        if (!controller.signal.aborted) set(document.id, { kind: 'idle' });
      } catch (error) {
        if (controller.signal.aborted) return;
        set(document.id, {
          kind: 'failed',
          message:
            error instanceof Error
              ? error.message
              : 'Le téléchargement a échoué. Réessayez.',
        });
      } finally {
        controllers.current.delete(document.id);
      }
    },
    [set],
  );

  return { transfers, download, capabilities: vaultStorage.capabilities };
}
