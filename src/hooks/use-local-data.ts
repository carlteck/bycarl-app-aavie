import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { subscribeToData } from '@/lib/sync-events';
import { syncStore } from '@/lib/sync-store';
import type { Entity, LocalRecord } from '@/lib/sync-types';

export function useLocalData(entity: Entity) {
  const { user } = useAuth();
  const userId = user?.id;
  const [state, setState] = useState<{
    userId?: string;
    rows: LocalRecord[];
    loaded: boolean;
  }>({ rows: [], loaded: false });
  useEffect(() => {
    if (!userId) return;
    let active = true;
    let generation = 0;
    const reload = async () => {
      const request = ++generation;
      try {
        const rows = await syncStore.read(userId, entity);
        if (active && request === generation)
          setState({ userId, rows, loaded: true });
      } catch {
        if (active) setState({ userId, rows: [], loaded: true });
      }
    };
    const unsubscribe = subscribeToData((owner, changed) => {
      if (owner === userId && changed === entity) void reload();
    });
    void reload();
    return () => {
      active = false;
      unsubscribe();
    };
  }, [userId, entity]);
  return {
    userId,
    rows: state.userId === userId ? state.rows : [],
    isLoaded: !userId || (state.userId === userId && state.loaded),
  };
}
