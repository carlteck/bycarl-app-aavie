const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { randomUUID } = require('node:crypto');
const Module = require('node:module');
const fs = require('node:fs');
const ts = require('typescript');

// Les requêtes de l'adaptateur natif tournent dans un vrai SQLite en mémoire.
const db = new DatabaseSync(':memory:');
db.exec(`CREATE TABLE local_profiles (user_id TEXT PRIMARY KEY, payload TEXT, updated_at TEXT);
  CREATE TABLE local_reminders (user_id TEXT, id TEXT, payload TEXT, updated_at TEXT);
  CREATE TABLE sync_outbox (id INTEGER, user_id TEXT, entity_type TEXT, entity_id TEXT, operation TEXT, payload TEXT, queued_at TEXT);
  INSERT INTO local_profiles VALUES ('legacy', '{"prenom":"Ancien"}', '2026-09-01');
  INSERT INTO sync_outbox VALUES (1, 'legacy', 'profile', 'legacy', 'upsert', '{"prenom":"Ancien"}', '2026-09-01');`);
const originalLoad = Module._load;
Module._load = function (id, ...args) {
  if (id === 'expo-crypto') return { randomUUID };
  if (id === 'expo-sqlite')
    return {
      openDatabaseAsync: async () => ({
        execAsync: async (sql) => db.exec(sql),
        runAsync: async (sql, ...params) => db.prepare(sql).run(...params),
        getFirstAsync: async (sql, ...params) =>
          db.prepare(sql).get(...params) ?? null,
        getAllAsync: async (sql, ...params) => db.prepare(sql).all(...params),
        withTransactionAsync: async (work) => {
          db.exec('BEGIN');
          try {
            await work();
            db.exec('COMMIT');
          } catch (error) {
            db.exec('ROLLBACK');
            throw error;
          }
        },
      }),
    };
  return originalLoad.call(this, id, ...args);
};
require.extensions['.ts'] = (module, filename) => {
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    filename,
  );
};
const { syncStore: native } = require('../src/lib/sync-store.native.ts');
const { synchronize } = require('../src/lib/sync-engine.ts');
const {
  toRemote,
  fromRemote,
  birthDateToISO,
} = require('../src/lib/sync-mapping.ts');
const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
};
const { syncStore: web } = require('../src/lib/sync-store.ts');
const signal = () => new AbortController().signal;

beforeEach(async () => {
  await native.read('legacy', 'profile');
  db.exec(
    "DELETE FROM mobile_cache WHERE user_id != 'legacy'; DELETE FROM mobile_queue WHERE user_id != 'legacy';",
  );
  storage.clear();
});

test('migration des profils et envois existants sans perte ni changement de propriétaire', async () => {
  assert.equal(
    (await native.read('legacy', 'profile'))[0].payload.prenom,
    'Ancien',
  );
  assert.equal((await native.pending('legacy'))[0].payload.prenom, 'Ancien');
  assert.deepEqual(await native.read('other', 'profile'), []);
});
for (const [name, store] of [
  ['SQLite', native],
  ['web', web],
]) {
  test(`${name}: panne puis reprise, réception distante, suppression`, async () => {
    await store.change('A', 'reminder', 'r1', () => ({ title: 'Local' }));
    const broken = {
      push: async () => {
        throw Error('offline');
      },
      pull: async () => {
        throw Error('offline');
      },
    };
    await assert.rejects(synchronize(store, broken, 'A', signal()));
    assert.equal((await store.pending('A')).length, 1);
    assert.equal((await store.read('A', 'reminder'))[0].payload.title, 'Local');
    const remote = new Map();
    const online = {
      push: async (change) => {
        if (change.deleted) remote.delete(change.id);
        else remote.set(change.id, { id: change.id, payload: change.payload });
      },
      pull: async (_user, entity) =>
        entity === 'reminder' ? [...remote.values()] : [],
    };
    await synchronize(store, online, 'A', signal());
    assert.equal((await store.pending('A')).length, 0);
    remote.set('r2', { id: 'r2', payload: { title: 'Autre appareil' } });
    await synchronize(store, online, 'A', signal());
    assert.equal((await store.read('A', 'reminder')).length, 2);
    await store.change('A', 'reminder', 'r1', () => null);
    await synchronize(store, online, 'A', signal());
    assert.deepEqual(
      (await store.read('A', 'reminder')).map((row) => row.id),
      ['r2'],
    );
    remote.clear();
    await synchronize(store, online, 'A', signal());
    assert.deepEqual(await store.read('A', 'reminder'), []);
  });
  test(`${name}: une nouvelle édition pendant l'envoi n'est ni acquittée ni écrasée`, async () => {
    await store.change('A', 'profile', 'A', () => ({ prenom: 'Avant' }));
    await synchronize(
      store,
      {
        push: async () => {
          await store.change('A', 'profile', 'A', () => ({ prenom: 'Après' }));
        },
        pull: async (_user, entity) =>
          entity === 'profile'
            ? [{ id: 'A', payload: { prenom: 'Avant' } }]
            : [],
      },
      'A',
      signal(),
    );
    assert.equal((await store.pending('A')).length, 1);
    assert.equal((await store.read('A', 'profile'))[0].payload.prenom, 'Après');
  });
  test(`${name}: une suppression en attente survit à un téléchargement obsolète`, async () => {
    await store.change('A', 'reminder', 'r1', () => ({ title: 'Ancien' }));
    await store.change('A', 'reminder', 'r1', () => null);
    await store.replace('A', 'reminder', [
      { id: 'r1', payload: { title: 'Ancien' } },
    ]);
    assert.deepEqual(await store.read('A', 'reminder'), []);
    assert.equal((await store.pending('A'))[0].deleted, true);
  });
  test(`${name}: isolation des comptes et annulation avant application distante`, async () => {
    await store.change('B', 'profile', 'B', () => ({ prenom: 'Privé' }));
    const controller = new AbortController();
    await assert.rejects(
      synchronize(
        store,
        {
          push: async () => assert.fail('Pas de modification du compte B'),
          pull: async () => {
            controller.abort();
            return [{ id: 'A', payload: { prenom: 'Obsolète' } }];
          },
        },
        'A',
        controller.signal,
      ),
    );
    assert.deepEqual(await store.read('A', 'profile'), []);
    assert.equal((await store.pending('B')).length, 1);
  });
  test(`${name}: échec d'un envoi isolé, les autres données continuent`, async () => {
    await store.change('A', 'profile', 'A', () => ({
      dateNaissance: 'invalide',
    }));
    await store.change('A', 'reminder', 'r1', () => ({ title: 'Valide' }));
    await assert.rejects(
      synchronize(
        store,
        {
          push: async (change) => {
            if (change.entity === 'profile') throw Error('validation');
          },
          pull: async (_user, entity) =>
            entity === 'reminder'
              ? [{ id: 'r1', payload: { title: 'Valide' } }]
              : [],
        },
        'A',
        signal(),
      ),
    );
    assert.deepEqual(
      (await store.pending('A')).map((row) => row.entity),
      ['profile'],
    );
    assert.equal(
      (await store.read('A', 'reminder'))[0].payload.title,
      'Valide',
    );
  });
}
test('adaptation exacte des civilités, dates et du récapitulatif', () => {
  const base = {
    userId: 'A',
    id: 'A',
    entity: 'profile',
    revision: '1',
    deleted: false,
  };
  const row = toRemote({
    ...base,
    payload: { civilite: 'Mme', dateNaissance: '29/02/2000', prenom: 'Alice' },
  });
  assert.equal(row.civility, 'madame');
  assert.equal(row.birth_date, '2000-02-29');
  assert.equal(fromRemote('profile', row).payload.dateNaissance, '29/02/2000');
  assert.equal(fromRemote('profile', row).payload.civilite, 'Mme');
  assert.equal(birthDateToISO(''), null);
  assert.throws(() => birthDateToISO('31/02/2000'));
  const progress = toRemote({
    ...base,
    id: 'cni',
    entity: 'progress',
    payload: {
      id: 'uuid',
      step: 'recap',
      status: 'completed',
      values: { nom: 'Test' },
      checkedDocuments: { photo: true },
    },
  });
  assert.equal(progress.current_step, 'summary');
  assert.equal(fromRemote('progress', progress).payload.step, 'recap');
});
test('SQLite: les écritures concurrentes restent atomiques et les patches sont fusionnés', async () => {
  await Promise.all([
    native.change('A', 'profile', 'A', (current) => ({
      ...current,
      prenom: 'Alice',
    })),
    native.change('A', 'profile', 'A', (current) => ({
      ...current,
      ville: 'Cayenne',
    })),
  ]);
  assert.deepEqual((await native.read('A', 'profile'))[0].payload, {
    prenom: 'Alice',
    ville: 'Cayenne',
  });
  const pending = await native.pending('A');
  assert.equal(pending.length, 1);
  assert.deepEqual(
    pending[0].payload,
    (await native.read('A', 'profile'))[0].payload,
  );
});

test('transport Supabase: conversions, filtre propriétaire, pagination et suppressions', async () => {
  const { createClient } = require('@supabase/supabase-js');
  const requests = [];
  let page = 0;
  const client = createClient('https://sync-test.invalid', 'public-test-key', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: async (input, init) => {
        const url = new URL(String(input));
        requests.push({
          url,
          method: init.method,
          body: init.body ? JSON.parse(init.body) : undefined,
        });
        if (init.method !== 'GET') return new Response(null, { status: 204 });
        const rows =
          page++ === 0
            ? Array.from({ length: 500 }, (_, i) => ({
                id: String(i).padStart(4, '0'),
                user_id: 'A',
                title: 'Rappel',
                due_date: '2026-10-01',
                category: 'Social',
                notifications_enabled: true,
                lead_days: 3,
                deleted_at: null,
              }))
            : [{ id: '0500', user_id: 'A', deleted_at: '2026-09-01' }];
        return new Response(JSON.stringify(rows), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      },
    },
  });
  const previous = Module._load;
  Module._load = function (id, parent, ...args) {
    if (id === './supabase' && parent.filename.endsWith('sync-remote.ts'))
      return { supabase: client };
    return previous.call(this, id, parent, ...args);
  };
  const { syncRemote } = require('../src/lib/sync-remote.ts');
  Module._load = previous;
  const change = {
    userId: 'A',
    entity: 'profile',
    id: 'A',
    revision: 'r',
    deleted: false,
    payload: { civilite: 'M.', dateNaissance: '01/01/2000' },
  };
  await syncRemote.push(change, signal());
  assert.equal(requests[0].body.user_id, 'A');
  assert.equal(requests[0].body.birth_date, '2000-01-01');
  assert.equal(requests[0].url.searchParams.get('on_conflict'), 'user_id');
  const rows = await syncRemote.pull('A', 'reminder', signal());
  assert.equal(rows.length, 500);
  assert.equal(requests[1].url.searchParams.get('user_id'), 'eq.A');
  assert.equal(requests[2].url.searchParams.get('id'), 'gt.0499');
  assert.equal(rows[0].payload.leadDays, 3);
  await syncRemote.push(
    { ...change, entity: 'reminder', id: 'r1', deleted: true },
    signal(),
  );
  const deletion = requests.at(-1);
  assert.equal(deletion.method, 'PATCH');
  assert.equal(deletion.url.searchParams.get('user_id'), 'eq.A');
  assert.equal(deletion.url.searchParams.get('id'), 'eq.r1');
  assert.ok(deletion.body.deleted_at);
});
