import { useCallback, useState } from 'react';

/** État d'un tirer-pour-rafraîchir : le spinner dure le temps réel du rechargement. */
export function usePullToRefresh(reload: () => Promise<void> | void) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  }, [reload]);
  return { refreshing, onRefresh };
}
