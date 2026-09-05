import * as Crypto from 'expo-crypto';
import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { Alert } from 'react-native';
import type { Reminder } from '@/constants/reminders';
import { useLocalData } from '@/hooks/use-local-data';
import { syncStore } from '@/lib/sync-store';

type Input = Omit<Reminder, 'id'>;
type Value = {
  reminders: Reminder[];
  isLoaded: boolean;
  addReminder: (input: Input) => void;
  updateReminder: (id: string, patch: Partial<Input>) => void;
  removeReminder: (id: string) => void;
};
const Context = createContext<Value | null>(null);
function failed() {
  Alert.alert(
    'Enregistrement impossible',
    'Le rappel n’a pas été enregistré sur cet appareil. Réessayez.',
  );
}
export function RemindersProvider({ children }: { children: ReactNode }) {
  const { userId, rows, isLoaded } = useLocalData('reminder');
  const addReminder = useCallback(
    (input: Input) => {
      if (!userId) return;
      const id = Crypto.randomUUID();
      void syncStore
        .change(userId, 'reminder', id, () => ({ ...input, id }))
        .catch(failed);
    },
    [userId],
  );
  const updateReminder = useCallback(
    (id: string, patch: Partial<Input>) => {
      if (userId)
        void syncStore
          .change(userId, 'reminder', id, (current) =>
            current ? { ...current, ...patch } : null,
          )
          .catch(failed);
    },
    [userId],
  );
  const removeReminder = useCallback(
    (id: string) => {
      if (userId)
        void syncStore.change(userId, 'reminder', id, () => null).catch(failed);
    },
    [userId],
  );
  return (
    <Context.Provider
      value={{
        reminders: rows.map((row) => row.payload as Reminder),
        isLoaded,
        addReminder,
        updateReminder,
        removeReminder,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useReminders() {
  const value = useContext(Context);
  if (!value) throw new Error('RemindersProvider absent');
  return value;
}
