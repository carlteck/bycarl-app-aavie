import type {
  Entity,
  LocalRecord,
  PendingChange,
  SyncStore,
} from './sync-types';

export type SyncRemote = {
  push: (change: PendingChange, signal: AbortSignal) => Promise<void>;
  pull: (
    userId: string,
    entity: Entity,
    signal: AbortSignal,
  ) => Promise<LocalRecord[]>;
};

export async function synchronize(
  store: SyncStore,
  remote: SyncRemote,
  userId: string,
  signal: AbortSignal,
) {
  const assertActive = () => {
    if (signal.aborted) throw new Error('Synchronisation annulée.');
  };
  const failures: unknown[] = [];
  for (const change of await store.pending(userId)) {
    assertActive();
    try {
      await remote.push(change, signal);
      assertActive();
      await store.acknowledge(change);
    } catch (error) {
      assertActive();
      failures.push(error);
    }
  }
  for (const entity of ['profile', 'reminder', 'progress'] as const) {
    assertActive();
    try {
      const rows = await remote.pull(userId, entity, signal);
      assertActive();
      await store.replace(userId, entity, rows);
    } catch (error) {
      assertActive();
      failures.push(error);
    }
  }
  if (failures.length)
    throw new Error('Certaines données restent à synchroniser.');
}
