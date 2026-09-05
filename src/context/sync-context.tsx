import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, Platform } from 'react-native';
import { useAuth } from './auth-context';
import { synchronize } from '@/lib/sync-engine';
import { subscribeToData } from '@/lib/sync-events';
import { syncStore } from '@/lib/sync-store';
import { syncRemote } from '@/lib/sync-remote';
import { isSupabaseConfigured } from '@/lib/supabase';

type Status = 'waiting' | 'syncing' | 'synced' | 'pending';
const Context = createContext<{ status: Status; retry: () => void }>({
  status: 'waiting',
  retry: () => {},
});
export function SyncProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [state, setState] = useState<{ userId: string; status: Status }>();
  const retryRef = useRef(() => {});
  useEffect(() => {
    if (!userId || !isSupabaseConfigured) return;
    let stopped = false;
    let running = false;
    let dirty = false;
    let controller: AbortController | undefined;
    let debounce: ReturnType<typeof setTimeout> | undefined;
    const active = () =>
      AppState.currentState !== 'background' &&
      AppState.currentState !== 'inactive' &&
      (Platform.OS !== 'web' || document.visibilityState !== 'hidden');
    const run = async () => {
      if (stopped || !active()) return;
      if (running) {
        dirty = true;
        return;
      }
      running = true;
      dirty = false;
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 25000);
      setState({ userId, status: 'syncing' });
      try {
        await synchronize(syncStore, syncRemote, userId, controller.signal);
        const pending = await syncStore.pending(userId);
        if (!stopped)
          setState({ userId, status: pending.length ? 'pending' : 'synced' });
      } catch {
        if (!stopped) setState({ userId, status: 'pending' });
      } finally {
        clearTimeout(timeout);
        running = false;
        if (dirty && !stopped) {
          dirty = false;
          debounce = setTimeout(() => void run(), 1000);
        }
      }
    };
    const schedule = () => {
      setState({ userId, status: 'pending' });
      clearTimeout(debounce);
      debounce = setTimeout(() => void run(), 700);
    };
    retryRef.current = () => {
      void run();
    };
    const unsubscribe = subscribeToData((owner, _entity, local) => {
      if (owner === userId && local) schedule();
    });
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void run();
      else controller?.abort();
    });
    const onOnline = () => {
      void run();
    };
    if (Platform.OS === 'web') {
      window.addEventListener('online', onOnline);
      document.addEventListener('visibilitychange', onOnline);
    }
    // Le retour du réseau est repris sans nouveau module natif, même sans événement AppState.
    const interval = setInterval(() => {
      void run();
    }, 15000);
    void run();
    return () => {
      stopped = true;
      controller?.abort();
      clearInterval(interval);
      clearTimeout(debounce);
      unsubscribe();
      subscription.remove();
      retryRef.current = () => {};
      if (Platform.OS === 'web') {
        window.removeEventListener('online', onOnline);
        document.removeEventListener('visibilitychange', onOnline);
      }
    };
  }, [userId]);
  return (
    <Context.Provider
      value={{
        status: state && state.userId === userId ? state.status : 'waiting',
        retry: () => retryRef.current(),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useSync() {
  return useContext(Context);
}
