import type { Entity } from './sync-types';

type Listener = (userId: string, entity: Entity, local: boolean) => void;
const listeners = new Set<Listener>();
export function subscribeToData(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function notifyData(userId: string, entity: Entity, local: boolean) {
  for (const listener of listeners) listener(userId, entity, local);
}
