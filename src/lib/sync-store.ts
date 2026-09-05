import { notifyData } from './sync-events';
import type {
  Entity,
  LocalRecord,
  PendingChange,
  SyncStore,
} from './sync-types';

type State = {
  rows: Partial<Record<Entity, LocalRecord[]>>;
  pending: PendingChange[];
};
function read(userId: string): State {
  const raw = globalThis.localStorage?.getItem(`aavie_sync:${userId}`);
  if (raw) return JSON.parse(raw) as State;
  const state: State = { rows: {}, pending: [] };
  const profile = globalThis.localStorage?.getItem(
    `aavie_user_profile:${userId}`,
  );
  const reminders = globalThis.localStorage?.getItem(
    `aavie_reminders:${userId}`,
  );
  if (profile)
    state.rows.profile = [{ id: userId, payload: JSON.parse(profile) }];
  if (reminders)
    state.rows.reminder = (JSON.parse(reminders) as { id: string }[]).map(
      (item) => ({ id: item.id, payload: item }),
    );
  for (const entity of ['profile', 'reminder'] as const) {
    for (const row of state.rows[entity] ?? [])
      state.pending.push({
        ...row,
        entity,
        userId,
        revision: crypto.randomUUID(),
        deleted: false,
      });
  }
  save(userId, state);
  return state;
}
function save(userId: string, state: State) {
  if (!globalThis.localStorage) throw new Error('Stockage local indisponible.');
  globalThis.localStorage.setItem(
    `aavie_sync:${userId}`,
    JSON.stringify(state),
  );
}
export const syncStore: SyncStore = {
  read: async (userId, entity) => read(userId).rows[entity] ?? [],
  change: async (userId, entity, id, update) => {
    const state = read(userId);
    const rows = state.rows[entity] ?? [];
    const previous = rows.find((row) => row.id === id)?.payload;
    const next = update(previous);
    state.rows[entity] = rows.filter((row) => row.id !== id);
    if (next !== null) state.rows[entity].push({ id, payload: next });
    state.pending = state.pending.filter(
      (row) => row.entity !== entity || row.id !== id,
    );
    state.pending.push({
      userId,
      entity,
      id,
      payload: next ?? previous ?? {},
      deleted: next === null,
      revision: crypto.randomUUID(),
    });
    save(userId, state);
    notifyData(userId, entity, true);
  },
  pending: async (userId) => read(userId).pending,
  acknowledge: async (change) => {
    const state = read(change.userId);
    state.pending = state.pending.filter(
      (row) =>
        row.entity !== change.entity ||
        row.id !== change.id ||
        row.revision !== change.revision,
    );
    save(change.userId, state);
  },
  replace: async (userId, entity, rows) => {
    const state = read(userId);
    const dirty = new Set(
      state.pending.filter((row) => row.entity === entity).map((row) => row.id),
    );
    state.rows[entity] = [
      ...(state.rows[entity] ?? []).filter((row) => dirty.has(row.id)),
      ...rows.filter((row) => !dirty.has(row.id)),
    ];
    save(userId, state);
    notifyData(userId, entity, false);
  },
};
