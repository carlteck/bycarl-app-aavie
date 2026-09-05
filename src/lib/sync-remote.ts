import { supabase } from './supabase';
import type { SyncRemote } from './sync-engine';
import { fromRemote, tables, toRemote } from './sync-mapping';
import type { Payload } from './sync-types';

export const syncRemote: SyncRemote = {
  async push(change, signal) {
    const table = tables[change.entity];
    if (change.deleted) {
      const query =
        change.entity === 'profile'
          ? supabase.from(table).delete().eq('user_id', change.userId)
          : supabase
              .from(table)
              .update({ deleted_at: new Date().toISOString() })
              .eq('user_id', change.userId)
              .eq(
                change.entity === 'progress' ? 'procedure_id' : 'id',
                change.id,
              );
      const { error } = await query.abortSignal(signal);
      if (error) throw error;
      return;
    }
    const { error } = await supabase
      .from(table)
      .upsert(toRemote(change), {
        onConflict:
          change.entity === 'profile'
            ? 'user_id'
            : change.entity === 'progress'
              ? 'user_id,procedure_id'
              : 'id',
      })
      .abortSignal(signal);
    if (error) throw error;
  },
  async pull(userId, entity, signal) {
    const rows: Payload[] = [];
    const key = entity === 'profile' ? 'user_id' : 'id';
    let cursor: string | undefined;
    for (;;) {
      let query = supabase
        .from(tables[entity])
        .select('*')
        .eq('user_id', userId)
        .order(key)
        .limit(500);
      if (cursor) query = query.gt(key, cursor);
      const { data, error } = await query.abortSignal(signal);
      if (error) throw error;
      const page = data as Payload[];
      rows.push(...page);
      if (page.length < 500) break;
      cursor = String(page[page.length - 1][key]);
    }
    return rows
      .filter((row) => !row.deleted_at)
      .map((row) => fromRemote(entity, row));
  },
};
