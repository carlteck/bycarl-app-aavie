import * as SQLite from 'expo-sqlite';

import type { Reminder } from '@/constants/reminders';
import type { StoredUserProfile } from '@/lib/profile-storage';

type Operation = 'upsert' | 'delete';

const databasePromise = (async () => {
  const db = await SQLite.openDatabaseAsync('aavie-offline.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS local_profiles (
      user_id TEXT PRIMARY KEY NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS local_reminders (
      user_id TEXT NOT NULL,
      id TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (user_id, id)
    );
    CREATE TABLE IF NOT EXISTS sync_outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      operation TEXT NOT NULL CHECK (operation IN ('upsert', 'delete')),
      payload TEXT,
      queued_at TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      UNIQUE (user_id, entity_type, entity_id)
    );
    CREATE INDEX IF NOT EXISTS idx_sync_outbox_queue ON sync_outbox (queued_at, id);
  `);
  return db;
})();

function database() {
  return databasePromise;
}

async function enqueue(
  userId: string,
  entityType: 'profile' | 'reminder',
  entityId: string,
  operation: Operation,
  payload?: unknown,
) {
  const db = await database();
  await db.runAsync(
    `INSERT INTO sync_outbox
       (user_id, entity_type, entity_id, operation, payload, queued_at, attempts, last_error)
     VALUES (?, ?, ?, ?, ?, ?, 0, NULL)
     ON CONFLICT(user_id, entity_type, entity_id) DO UPDATE SET
       operation = excluded.operation,
       payload = excluded.payload,
       queued_at = excluded.queued_at,
       attempts = 0,
       last_error = NULL`,
    userId,
    entityType,
    entityId,
    operation,
    payload === undefined ? null : JSON.stringify(payload),
    new Date().toISOString(),
  );
}

export async function readProfile(userId: string): Promise<StoredUserProfile> {
  const db = await database();
  const row = await db.getFirstAsync<{ payload: string }>(
    'SELECT payload FROM local_profiles WHERE user_id = ?',
    userId,
  );
  if (!row) return {};
  try {
    return JSON.parse(row.payload) as StoredUserProfile;
  } catch {
    return {};
  }
}

export async function writeProfile(userId: string, profile: StoredUserProfile) {
  const db = await database();
  const updatedAt = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO local_profiles (user_id, payload, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`,
      userId,
      JSON.stringify(profile),
      updatedAt,
    );
    await enqueue(userId, 'profile', userId, 'upsert', {
      ...profile,
      updated_at: updatedAt,
    });
  });
}

export async function clearProfile(userId: string) {
  const db = await database();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM local_profiles WHERE user_id = ?', userId);
    await enqueue(userId, 'profile', userId, 'delete');
  });
}

export async function readReminders(userId: string): Promise<Reminder[]> {
  const db = await database();
  const rows = await db.getAllAsync<{ payload: string }>(
    'SELECT payload FROM local_reminders WHERE user_id = ? ORDER BY updated_at, id',
    userId,
  );
  return rows.flatMap((row) => {
    try {
      return [JSON.parse(row.payload) as Reminder];
    } catch {
      return [];
    }
  });
}

export async function writeReminders(userId: string, reminders: Reminder[]) {
  const db = await database();
  const existing = await db.getAllAsync<{ id: string }>(
    'SELECT id FROM local_reminders WHERE user_id = ?',
    userId,
  );
  const nextIds = new Set(reminders.map((reminder) => reminder.id));
  const updatedAt = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    for (const reminder of reminders) {
      await db.runAsync(
        `INSERT INTO local_reminders (user_id, id, payload, updated_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(user_id, id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`,
        userId,
        reminder.id,
        JSON.stringify(reminder),
        updatedAt,
      );
      await enqueue(userId, 'reminder', reminder.id, 'upsert', {
        ...reminder,
        updated_at: updatedAt,
      });
    }

    for (const row of existing) {
      if (nextIds.has(row.id)) continue;
      await db.runAsync(
        'DELETE FROM local_reminders WHERE user_id = ? AND id = ?',
        userId,
        row.id,
      );
      await enqueue(userId, 'reminder', row.id, 'delete');
    }
  });
}
