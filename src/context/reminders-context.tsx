import * as Crypto from 'expo-crypto';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Reminder } from '@/constants/reminders';
import { readStoredReminders, writeStoredReminders } from '@/lib/reminders-storage';

type ReminderInput = Omit<Reminder, 'id'>;

type RemindersContextValue = {
  reminders: Reminder[];
  isLoaded: boolean;
  addReminder: (input: ReminderInput) => void;
  updateReminder: (id: string, patch: Partial<ReminderInput>) => void;
  removeReminder: (id: string) => void;
};

const RemindersContext = createContext<RemindersContextValue | null>(null);

/**
 * Échéances locales partagées par les modules Planificateur administratif et Notifications et
 * rappels (une seule source de données, deux vues — voir CLAUDE.md). Même pattern de persistance
 * que `user-profile-context.tsx` : état initial synchrone vide, chargement asynchrone non bloquant.
 */
export function RemindersProvider({ children }: { children: ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await readStoredReminders();
        setReminders(stored);
      } catch (error) {
        console.warn('Échec de la lecture des échéances locales.', error);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback((next: Reminder[]) => {
    writeStoredReminders(next).catch((error) =>
      console.warn('Échec de l’enregistrement des échéances locales.', error)
    );
  }, []);

  const addReminder = useCallback(
    (input: ReminderInput) => {
      setReminders((current) => {
        const next = [...current, { ...input, id: Crypto.randomUUID() }];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const updateReminder = useCallback(
    (id: string, patch: Partial<ReminderInput>) => {
      setReminders((current) => {
        const next = current.map((reminder) => (reminder.id === id ? { ...reminder, ...patch } : reminder));
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const removeReminder = useCallback(
    (id: string) => {
      setReminders((current) => {
        const next = current.filter((reminder) => reminder.id !== id);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const value = useMemo(
    () => ({ reminders, isLoaded, addReminder, updateReminder, removeReminder }),
    [reminders, isLoaded, addReminder, updateReminder, removeReminder]
  );

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}

export function useReminders() {
  const context = useContext(RemindersContext);
  if (!context) throw new Error('useReminders must be used within a RemindersProvider');
  return context;
}
