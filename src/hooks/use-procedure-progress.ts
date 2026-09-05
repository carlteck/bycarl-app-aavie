import * as Crypto from 'expo-crypto';
import { Alert } from 'react-native';
import { useLocalData } from './use-local-data';
import { syncStore } from '@/lib/sync-store';
import type { ProcedureProgress } from '@/lib/sync-types';

export function useProcedureProgress(procedureId: string) {
  const { userId, rows, isLoaded } = useLocalData('progress');
  const progress = rows.find((row) => row.id === procedureId)?.payload as
    ProcedureProgress | undefined;
  const change = async (
    update: (current: ProcedureProgress) => ProcedureProgress,
  ) => {
    if (!userId || !isLoaded) return;
    try {
      await syncStore.change(userId, 'progress', procedureId, (current) =>
        update(
          (current as ProcedureProgress | undefined) ?? {
            id: Crypto.randomUUID(),
            procedureId,
            status: 'in_progress',
            step: 'overview',
            values: {},
            checkedDocuments: {},
          },
        ),
      );
    } catch {
      Alert.alert(
        'Enregistrement impossible',
        'Votre avancement n’a pas pu être enregistré. Réessayez.',
      );
      throw new Error('Enregistrement local impossible.');
    }
  };
  return { progress, isLoaded, change };
}
