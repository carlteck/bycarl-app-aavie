import * as Crypto from 'expo-crypto';
import * as SQLite from 'expo-sqlite';
import { notifyData } from './sync-events';
import type {
  Entity,
  LocalRecord,
  Payload,
  PendingChange,
  SyncStore,
} from './sync-types';

let queue: Promise<unknown> = Promise.resolve();
function serial<T>(work: () => Promise<T>): Promise<T> {
  const result = queue.catch(() => {}).then(work);
  queue = result;
  return result;
}
const database = (async () => {
  const db = await SQLite.openDatabaseAsync('aavie-offline.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS mobile_cache (
      user_id TEXT NOT NULL, entity TEXT NOT NULL, id TEXT NOT NULL, payload TEXT NOT NULL,
      PRIMARY KEY(user_id, entity, id)
    );
    CREATE TABLE IF NOT EXISTS mobile_queue (
      user_id TEXT NOT NULL, entity TEXT NOT NULL, id TEXT NOT NULL, payload TEXT NOT NULL,
      revision TEXT NOT NULL, deleted INTEGER NOT NULL,
      PRIMARY KEY(user_id, entity, id)
    );
    CREATE TABLE IF NOT EXISTS mobile_cache_migrations (version INTEGER PRIMARY KEY);
  `);
  if (
    !(await db.getFirstAsync(
      'SELECT version FROM mobile_cache_migrations WHERE version = 1',
    ))
  ) {
    await db.withTransactionAsync(async () => {
      for (const [table, entity, idColumn] of [
        ['local_profiles', 'profile', 'user_id'],
        ['local_reminders', 'reminder', 'id'],
      ]) {
        if (
          await db.getFirstAsync(
            'SELECT name FROM sqlite_master WHERE type = ? AND name = ?',
            'table',
            table,
          )
        ) {
          await db.execAsync(
            `INSERT OR IGNORE INTO mobile_cache SELECT user_id, '${entity}', ${idColumn}, payload FROM ${table};`,
          );
        }
      }
      if (
        await db.getFirstAsync(
          "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sync_outbox'",
        )
      ) {
        await db.execAsync(`INSERT OR IGNORE INTO mobile_queue
          SELECT user_id, entity_type, entity_id, coalesce(payload, '{}'), cast(id AS TEXT) || ':' || queued_at, operation = 'delete'
          FROM sync_outbox WHERE entity_type IN ('profile', 'reminder');`);
      }
      await db.runAsync('INSERT INTO mobile_cache_migrations VALUES (1)');
    });
  }
  return db;
})();

export const syncStore: SyncStore = {
  read: (userId, entity) =>
    serial(async () => {
      const db = await database;
      const rows = await db.getAllAsync<{ id: string; payload: string }>(
        'SELECT id, payload FROM mobile_cache WHERE user_id = ? AND entity = ? ORDER BY id',
        userId,
        entity,
      );
      return rows.map((row) => ({
        id: row.id,
        payload: JSON.parse(row.payload) as Payload,
      }));
    }),
  change: (userId, entity, id, update) =>
    serial(async () => {
      const db = await database;
      await db.withTransactionAsync(async () => {
        const row = await db.getFirstAsync<{ payload: string }>(
          'SELECT payload FROM mobile_cache WHERE user_id = ? AND entity = ? AND id = ?',
          userId,
          entity,
          id,
        );
        const previous = row ? (JSON.parse(row.payload) as Payload) : undefined;
        const next = update(previous);
        const payload = JSON.stringify(next ?? previous ?? {});
        if (next === null)
          await db.runAsync(
            'DELETE FROM mobile_cache WHERE user_id = ? AND entity = ? AND id = ?',
            userId,
            entity,
            id,
          );
        else
          await db.runAsync(
            'INSERT OR REPLACE INTO mobile_cache VALUES (?, ?, ?, ?)',
            userId,
            entity,
            id,
            payload,
          );
        await db.runAsync(
          'INSERT OR REPLACE INTO mobile_queue VALUES (?, ?, ?, ?, ?, ?)',
          userId,
          entity,
          id,
          payload,
          Crypto.randomUUID(),
          next === null ? 1 : 0,
        );
      });
      notifyData(userId, entity, true);
    }),
  pending: (userId) =>
    serial(async () => {
      const db = await database;
      const rows = await db.getAllAsync<{
        user_id: string;
        entity: Entity;
        id: string;
        payload: string;
        revision: string;
        deleted: number;
      }>(
        'SELECT * FROM mobile_queue WHERE user_id = ? ORDER BY entity, id',
        userId,
      );
      return rows.map((row) => ({
        userId: row.user_id,
        entity: row.entity,
        id: row.id,
        payload: JSON.parse(row.payload) as Payload,
        revision: row.revision,
        deleted: Boolean(row.deleted),
      }));
    }),
  acknowledge: (change: PendingChange) =>
    serial(async () => {
      const db = await database;
      await db.runAsync(
        'DELETE FROM mobile_queue WHERE user_id = ? AND entity = ? AND id = ? AND revision = ?',
        change.userId,
        change.entity,
        change.id,
        change.revision,
      );
    }),
  replace: (userId: string, entity: Entity, rows: LocalRecord[]) =>
    serial(async () => {
      const db = await database;
      await db.withTransactionAsync(async () => {
        const pending = await db.getAllAsync<{ id: string }>(
          'SELECT id FROM mobile_queue WHERE user_id = ? AND entity = ?',
          userId,
          entity,
        );
        const dirty = new Set(pending.map((row) => row.id));
        await db.runAsync(
          `DELETE FROM mobile_cache WHERE user_id = ? AND entity = ? AND id NOT IN
        (SELECT id FROM mobile_queue WHERE user_id = ? AND entity = ?)`,
          userId,
          entity,
          userId,
          entity,
        );
        for (const row of rows) {
          if (!dirty.has(row.id))
            await db.runAsync(
              'INSERT OR REPLACE INTO mobile_cache VALUES (?, ?, ?, ?)',
              userId,
              entity,
              row.id,
              JSON.stringify(row.payload),
            );
        }
      });
      notifyData(userId, entity, false);
    }),
};
