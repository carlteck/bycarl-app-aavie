import * as Crypto from 'expo-crypto';
import { useCallback, useMemo } from 'react';

import { useLocalData } from '@/hooks/use-local-data';
import { compareEntries, toBudgetEntry, type BudgetEntry } from '@/lib/budget';
import { syncStore } from '@/lib/sync-store';

export type BudgetInput = Omit<BudgetEntry, 'id'>;

/**
 * Budget personnel : lecture depuis la copie locale (SQLite / localStorage), écriture locale
 * immédiate puis envoi par le moteur de synchronisation — donc utilisable hors ligne, comme le
 * planificateur. Les écritures retournent une promesse : l'écran décide comment annoncer un
 * échec d'enregistrement local.
 */
export function useBudget() {
  const { userId, rows, isLoaded } = useLocalData('budget');

  const entries = useMemo(
    () =>
      rows
        .map((row) => toBudgetEntry(row.payload))
        .filter((entry): entry is BudgetEntry => entry !== null)
        .sort(compareEntries),
    [rows],
  );

  const save = useCallback(
    async (input: BudgetInput, id: string = Crypto.randomUUID()) => {
      if (!userId) throw new Error('Aucun compte connecté.');
      await syncStore.change(userId, 'budget', id, () => ({ ...input, id }));
    },
    [userId],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!userId) throw new Error('Aucun compte connecté.');
      await syncStore.change(userId, 'budget', id, () => null);
    },
    [userId],
  );

  return { entries, isLoaded, save, remove };
}
