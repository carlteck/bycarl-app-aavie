const { test } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');
const fs = require('node:fs');
const ts = require('typescript');

// --- Environnement : alias `@/`, TypeScript à la volée, modules natifs simulés ---------------
const src = path.join(__dirname, '..', 'src');
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith('@/')) request = path.join(src, request.slice(2));
  return originalResolve.call(this, request, ...rest);
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

/** Faux client Supabase : enregistre les appels de la chaîne et répond selon `respond`. */
const calls = [];
let respond = () => ({ data: [], error: null });
function chain(table) {
  const record = { table, steps: [] };
  calls.push(record);
  const proxy = new Proxy(
    {},
    {
      get(_target, name) {
        if (name === 'then')
          return (resolve, reject) =>
            Promise.resolve(respond(record)).then(resolve, reject);
        return (...args) => {
          record.steps.push([String(name), args]);
          return proxy;
        };
      },
    },
  );
  return proxy;
}
const fakeSupabase = {
  from: (table) => chain(table),
  functions: { invoke: async () => ({ data: null, error: null }) },
};
class FunctionsHttpError extends Error {}
class FunctionsFetchError extends Error {}
class FunctionsRelayError extends Error {}
let counter = 0;
const originalLoad = Module._load;
Module._load = function (id, ...args) {
  if (id === '@/lib/supabase')
    return { supabase: fakeSupabase, isSupabaseConfigured: true };
  if (id === 'expo-crypto')
    return {
      randomUUID: () =>
        `00000000-0000-4000-8000-${String(++counter).padStart(12, '0')}`,
    };
  if (id === '@supabase/supabase-js')
    return { FunctionsHttpError, FunctionsFetchError, FunctionsRelayError };
  return originalLoad.call(this, id, ...args);
};
const lib = (name) => require(path.join(src, 'lib', name));
const step = (record, name) => record.steps.find(([n]) => n === name);

const UUID = 'a1b2c3d4-0000-4000-8000-000000000001';

// --- Budget -----------------------------------------------------------------------------------
test('budget : montants saisis → centimes entiers, sans flottant', () => {
  const { parseAmountToCents } = lib('budget.ts');
  assert.equal(parseAmountToCents('12,50'), 1250);
  assert.equal(parseAmountToCents('12.5'), 1250);
  assert.equal(parseAmountToCents('1 200,00'), 120000);
  assert.equal(parseAmountToCents('0,10'), 10);
  assert.equal(parseAmountToCents('0,3'), 30);
  for (const bad of [
    '',
    '0',
    '0,00',
    '-5',
    '12,345',
    'abc',
    '1e3',
    '100000000',
    '12,',
  ])
    assert.equal(parseAmountToCents(bad), null, `refuse « ${bad} »`);
  assert.equal(parseAmountToCents('99999999,99'), 9999999999);
});

test('budget : format français, signe et totaux', () => {
  const { formatCents, summarize, monthKey, inMonth, toBudgetEntry } =
    lib('budget.ts');
  assert.equal(formatCents(123456), '1 234,56 €');
  assert.equal(formatCents(5, '+'), '+0,05 €');
  assert.equal(formatCents(-250), '−2,50 €');
  const entries = [
    {
      id: '1',
      label: 'a',
      amountCents: 150000,
      kind: 'income',
      category: 'x',
      dateISO: '2026-09-01',
    },
    {
      id: '2',
      label: 'b',
      amountCents: 115050,
      kind: 'expense',
      category: 'x',
      dateISO: '2026-08-31',
    },
  ];
  assert.deepEqual(summarize(entries), {
    incomeCents: 150000,
    expenseCents: 115050,
    balanceCents: 34950,
  });
  assert.equal(monthKey('month', '2026-09-20'), '2026-09');
  assert.equal(monthKey('previous', '2026-01-05'), '2025-12');
  assert.equal(monthKey('all', '2026-09-20'), null);
  assert.equal(inMonth(entries[1], monthKey('previous', '2026-09-20')), true);
  assert.equal(toBudgetEntry({ ...entries[0], amountCents: 1.5 }), null);
  assert.equal(toBudgetEntry({ ...entries[0], kind: 'refund' }), null);
  assert.equal(toBudgetEntry({ ...entries[0], dateISO: '01/09/2026' }), null);
});

test('budget : conversion vers mobile_budget_entries et retour', () => {
  const { toRemote, fromRemote, tables } = lib('sync-mapping.ts');
  assert.equal(tables.budget, 'mobile_budget_entries');
  const payload = {
    id: UUID,
    label: 'Loyer',
    amountCents: 45050,
    kind: 'expense',
    category: 'Logement',
    dateISO: '2026-09-05',
  };
  const row = toRemote({
    entity: 'budget',
    userId: 'u',
    id: UUID,
    payload,
    revision: 'r',
    deleted: false,
  });
  assert.deepEqual(row, {
    id: UUID,
    user_id: 'u',
    label: 'Loyer',
    amount: 450.5,
    type: 'expense',
    category: 'Logement',
    entry_date: '2026-09-05',
    deleted_at: null,
  });
  assert.deepEqual(
    fromRemote('budget', { ...row, amount: '450.50' }).payload,
    payload,
  );
  // Un montant négatif venu du site n'inverse pas le sens : `type` le porte.
  assert.equal(
    fromRemote('budget', { ...row, amount: -12.34 }).payload.amountCents,
    1234,
  );
});

// --- Données distantes ------------------------------------------------------------------------
test('liens : seul https est accepté, jamais un schéma exécutable', () => {
  const { safeExternalUrl, safePhoneNumber } = lib('external-url.ts');
  assert.equal(
    safeExternalUrl('https://www.caf.fr/x?a=1'),
    'https://www.caf.fr/x?a=1',
  );
  for (const bad of [
    'javascript:alert(1)',
    'http://caf.fr',
    'intent://x#Intent;end',
    'file:///etc/passwd',
    'https://user:pw@caf.fr',
    'https://localhost',
    '',
    null,
    42,
    'https://' + 'a'.repeat(3000) + '.fr',
  ])
    assert.equal(
      safeExternalUrl(bad),
      null,
      `refuse ${String(bad).slice(0, 30)}`,
    );
  assert.equal(safePhoneNumber('05 94 39 46 00'), '0594394600');
  assert.equal(safePhoneNumber('+594 594 39 46 00'), '+594594394600');
  for (const bad of ['tel:1;rm', '12', 'abc', '05 94 39 46 00 ; x', null])
    assert.equal(safePhoneNumber(bad), null);
});

test('recherche : le motif ne peut pas modifier le filtre PostgREST', () => {
  const { toIlikePattern } = lib('search-term.ts');
  assert.equal(toIlikePattern('carte'), '%carte%');
  assert.equal(toIlikePattern('a'), null);
  assert.equal(toIlikePattern('x),id.eq.1,(y'), '%x id eq 1 y%');
  assert.equal(toIlikePattern('100%_"\'`'), '%100%');
  assert.equal(toIlikePattern('  '), null);
});

test('erreurs distantes : classement et messages', () => {
  const { classifyRemoteError } = lib('remote-error.ts');
  assert.equal(classifyRemoteError({ code: 'PGRST205' }), 'unavailable');
  assert.equal(classifyRemoteError({ code: '42P01' }), 'unavailable');
  assert.equal(classifyRemoteError({ code: '42501' }), 'forbidden');
  assert.equal(classifyRemoteError({ code: 'PGRST301' }), 'auth');
  assert.equal(classifyRemoteError({ status: 401 }), 'auth');
  assert.equal(
    classifyRemoteError(new TypeError('Network request failed')),
    'network',
  );
  const abort = new Error('x');
  abort.name = 'AbortError';
  assert.equal(classifyRemoteError(abort), 'network');
  assert.equal(classifyRemoteError('boom'), 'unknown');
});

test('Markdown : structure reconnue, liens filtrés, rien d’exécutable', () => {
  const { parseMarkdown, parseInline, markdownToPlainText } =
    lib('simple-markdown.ts');
  const blocks = parseMarkdown(
    '# Titre\n\nUn **gras** et *italique*.\n\n- un\n- deux\n\n1. a\n2. b\n\n> cité\n\n---\n\n| A | B |\n|---|---|\n| 1 | 2 |',
  );
  assert.deepEqual(
    blocks.map((b) => b.type),
    [
      'heading',
      'paragraph',
      'list',
      'list',
      'quote',
      'rule',
      'paragraph',
      'paragraph',
    ],
  );
  assert.equal(blocks[2].ordered, false);
  assert.equal(blocks[3].ordered, true);
  assert.equal(blocks[0].level, 1);
  assert.equal(parseMarkdown('##### Profond')[0].level, 3);
  const inline = parseInline(
    '[ok](https://caf.fr) et [piège](javascript:alert(1))',
  );
  assert.equal(inline[0].href, 'https://caf.fr/');
  assert.equal(inline.find((p) => p.text === 'piège').href, undefined);
  // Du HTML reste du texte : le rendu passe par <Text>, jamais par une injection de balises.
  assert.equal(
    markdownToPlainText('<script>alert(1)</script>'),
    '<script>alert(1)</script>',
  );
  assert.equal(markdownToPlainText('**a** [b](https://x.fr)'), 'a b');
  assert.deepEqual(parseMarkdown(''), []);
});

test('mappeurs : une ligne invalide est écartée, jamais affichée à moitié', () => {
  const { mapTicket, mapMessage } = lib('support.ts');
  const { mapNews } = lib('regulatory-news.ts');
  const { mapResource } = lib('resources.ts');
  const { mapRemoteContact } = lib('annuaire-remote.ts');
  const { mapVaultDocument } = lib('vault.ts');
  const { mapCredits, mapAssistantMessage } = lib('assistant.ts');
  const { mapSection } = lib('manual.ts');

  const at = '2026-09-20T10:00:00Z';
  assert.equal(
    mapTicket({
      id: UUID,
      subject: 'Aide',
      category: 'zzz',
      status: 'open',
      last_message_at: at,
    }).category,
    'autre',
  );
  assert.equal(
    mapTicket({
      id: UUID,
      subject: 'Aide',
      status: 'inconnu',
      last_message_at: at,
    }),
    null,
  );
  assert.equal(
    mapTicket({
      id: 'pas-un-uuid',
      subject: 'Aide',
      status: 'open',
      last_message_at: at,
    }),
    null,
  );
  assert.equal(
    mapMessage({ id: UUID, author_role: 'admin', body: 'x', created_at: at }),
    null,
  );

  const news = mapNews({
    id: UUID,
    title: 'T',
    description: '**Texte**',
    tag: 'Guyane',
    published_date: '2026-09-01',
    source_url: 'javascript:1',
  });
  assert.equal(news.sourceUrl, undefined);
  assert.equal(news.excerpt, 'Texte');
  assert.equal(
    mapNews({
      id: UUID,
      title: 'T',
      description: 'd',
      tag: 'Autre',
      published_date: '2026-09-01',
    }),
    null,
  );
  assert.equal(
    mapNews({
      id: UUID,
      title: 'T',
      description: 'd',
      tag: 'Guyane',
      published_date: '2026-02-30',
    }),
    null,
  );

  assert.equal(
    mapResource({ id: UUID, title: 'R', category: '', description: '' }),
    null,
  );
  assert.equal(
    mapResource({
      id: UUID,
      title: 'R',
      category: 'Logement',
      description: 'd',
      url: 'http://x.fr',
    }).url,
    undefined,
  );

  const contact = mapRemoteContact({
    id: UUID,
    name: 'CAF',
    category: 'Famille',
    phone: '05 94 00 00 00',
    website: 'javascript:1',
    description: null,
  });
  assert.equal(
    contact.category,
    'Famille',
    'la catégorie publiée n’est pas reclassée',
  );
  assert.equal(contact.website, undefined);
  assert.equal(contact.phone, '0594000000');
  assert.equal(mapRemoteContact({ id: UUID, name: '', category: 'x' }), null);

  const doc = {
    id: UUID,
    title: 'Passeport',
    category: 'identite',
    mime_type: 'application/pdf',
    size_bytes: 10,
    storage_provider: 'external',
    transfer_status: 'pending',
    created_at: at,
  };
  assert.equal(mapVaultDocument(doc).category, 'identite');
  assert.equal(mapVaultDocument({ ...doc, storage_provider: 'ftp' }), null);
  assert.equal(mapVaultDocument({ ...doc, size_bytes: -1 }), null);

  assert.equal(mapCredits({ balance: 12, monthly_allowance: 200 }).balance, 12);
  assert.equal(mapCredits({ balance: '12', monthly_allowance: 200 }), null);
  assert.equal(
    mapAssistantMessage({
      id: 7,
      role: 'assistant',
      content: 'ok',
      created_at: at,
    }).id,
    '7',
  );
  assert.equal(
    mapAssistantMessage({
      id: 7,
      role: 'system',
      content: 'ok',
      created_at: at,
    }),
    null,
  );

  const section = mapSection({
    id: UUID,
    title: 'S',
    mobile_manual_articles: [
      { id: UUID, title: 'A' },
      { id: 'x', title: 'B' },
    ],
  });
  assert.equal(section.articles.length, 1);
});

test('manuel : recherche sans accents ni casse, tous les mots', () => {
  const { searchManual } = lib('manual.ts');
  const sections = [
    {
      id: 's',
      title: 'Prise en main',
      articles: [
        { id: 'a', title: 'Ajouter une échéance', summary: 'Planificateur' },
        { id: 'b', title: 'Mon budget' },
      ],
    },
  ];
  assert.deepEqual(
    searchManual(sections, 'ECHEANCE').map((h) => h.article.id),
    ['a'],
  );
  assert.deepEqual(
    searchManual(sections, 'ajouter planificateur').map((h) => h.article.id),
    ['a'],
  );
  assert.deepEqual(searchManual(sections, 'inconnu'), []);
  assert.deepEqual(searchManual(sections, '   '), []);
});

// --- Requêtes ---------------------------------------------------------------------------------
test('veille : pagination, filtre et recherche assainie', async () => {
  const { fetchNewsPage } = lib('regulatory-news.ts');
  calls.length = 0;
  await fetchNewsPage(
    2,
    'Guyane',
    'a,b) or (id.eq.1',
    new AbortController().signal,
  );
  const q = calls[0];
  assert.equal(q.table, 'regulatory_news');
  assert.deepEqual(step(q, 'range')[1], [40, 60]);
  assert.deepEqual(step(q, 'eq')[1], ['tag', 'Guyane']);
  assert.equal(
    step(q, 'or')[1][0],
    'title.ilike.%a b or id eq 1%,description.ilike.%a b or id eq 1%',
  );
  calls.length = 0;
  await fetchNewsPage(0, 'all', 'x', new AbortController().signal);
  assert.equal(step(calls[0], 'eq'), undefined);
  assert.equal(step(calls[0], 'or'), undefined);
});

test('pagination : la ligne témoin dit qu’il en reste, sans être affichée', async () => {
  const { fetchTickets } = lib('support.ts');
  const row = (i) => ({
    id: `a1b2c3d4-0000-4000-8000-${String(i).padStart(12, '0')}`,
    subject: 'Demande',
    status: 'open',
    category: 'autre',
    last_message_at: '2026-09-20T10:00:00Z',
  });
  respond = () => ({
    data: Array.from({ length: 21 }, (_, i) => row(i)),
    error: null,
  });
  const page = await fetchTickets(0, 'all', new AbortController().signal);
  assert.equal(page.items.length, 20);
  assert.equal(page.hasMore, true);
  respond = () => ({
    data: Array.from({ length: 20 }, (_, i) => row(i)),
    error: null,
  });
  assert.equal(
    (await fetchTickets(0, 'all', new AbortController().signal)).hasMore,
    false,
  );
  respond = () => ({ data: null, error: { code: '42501' } });
  await assert.rejects(fetchTickets(0, 'all', new AbortController().signal));
  respond = () => ({ data: [], error: null });
});

test('support : un renvoi après coupure ne crée ni doublon ni erreur', async () => {
  const { createTicket, newTicketIds } = lib('support.ts');
  const ids = newTicketIds();
  calls.length = 0;
  // Premier essai : la demande est déjà en base (violation d'unicité) → on continue au message.
  respond = (record) =>
    record.table === 'mobile_support_tickets'
      ? { data: null, error: { code: '23505' } }
      : { data: null, error: null };
  const id = await createTicket(
    'u1',
    { subject: '  Besoin  ', category: 'compte', body: ' Bonjour ' },
    ids,
  );
  assert.equal(id, ids.ticketId);
  const [ticketCall, messageCall] = calls;
  assert.deepEqual(step(ticketCall, 'insert')[1][0], {
    id: ids.ticketId,
    user_id: 'u1',
    subject: 'Besoin',
    category: 'compte',
  });
  assert.deepEqual(step(messageCall, 'insert')[1][0], {
    id: ids.messageId,
    ticket_id: ids.ticketId,
    user_id: 'u1',
    body: 'Bonjour',
  });
  // Toute autre erreur remonte.
  respond = () => ({ data: null, error: { code: '42501' } });
  await assert.rejects(
    createTicket(
      'u1',
      { subject: 'Besoin', category: 'compte', body: 'x' },
      newTicketIds(),
    ),
  );
  respond = () => ({ data: [], error: null });
});

test('coffre-fort : tant que le stockage n’est pas choisi, tout refuse honnêtement', async () => {
  const { vaultStorage, VaultUnavailableError, formatBytes } = lib('vault.ts');
  assert.deepEqual(vaultStorage.capabilities, {
    upload: false,
    download: false,
  });
  await assert.rejects(
    vaultStorage.upload({}, new AbortController().signal),
    VaultUnavailableError,
  );
  await assert.rejects(
    vaultStorage.download({}, new AbortController().signal),
    VaultUnavailableError,
  );
  assert.equal(formatBytes(900), '900 o');
  assert.equal(formatBytes(1536), '1,5 Ko');
  assert.equal(formatBytes(5 * 1024 * 1024), '5,0 Mo');
});

test('assistant : erreurs du serveur traduites sans lire le corps de la réponse', async () => {
  const assistant = lib('assistant.ts');
  const failWith = (error) => {
    fakeSupabase.functions.invoke = async () => ({ data: null, error });
    return assistant.sendAssistantMessage({
      conversationId: null,
      message: 'x',
      clientMessageId: UUID,
      signal: new AbortController().signal,
    });
  };
  const http = (status) =>
    Object.assign(new FunctionsHttpError('x'), { context: { status } });
  for (const [status, kind] of [
    [401, 'auth'],
    [402, 'credits'],
    [429, 'rate_limit'],
    [404, 'unavailable'],
    [503, 'unavailable'],
    [400, 'unknown'],
  ])
    await assert.rejects(
      failWith(http(status)),
      (e) => e.kind === kind,
      `${status} → ${kind}`,
    );
  await assert.rejects(
    failWith(new FunctionsFetchError('x')),
    (e) => e.kind === 'network',
  );
  await assert.rejects(
    failWith(new FunctionsRelayError('x')),
    (e) => e.kind === 'unavailable',
  );
  // Succès : seul l'identifiant de conversation, validé, est repris de la réponse.
  fakeSupabase.functions.invoke = async (name, options) => {
    assert.equal(name, 'assistant-chat');
    assert.deepEqual(options.body, {
      conversation_id: null,
      message: 'x',
      client_message_id: UUID,
    });
    return { data: { conversation_id: UUID, reply: 'ignoré' }, error: null };
  };
  assert.deepEqual(
    await assistant.sendAssistantMessage({
      conversationId: null,
      message: 'x',
      clientMessageId: UUID,
      signal: new AbortController().signal,
    }),
    { conversationId: UUID },
  );
  fakeSupabase.functions.invoke = async () => ({
    data: { conversation_id: 'pas-un-uuid' },
    error: null,
  });
  await assert.rejects(
    assistant.sendAssistantMessage({
      conversationId: null,
      message: 'x',
      clientMessageId: UUID,
      signal: new AbortController().signal,
    }),
    (e) => e.kind === 'unknown',
  );
});
