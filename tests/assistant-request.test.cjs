/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

const filename = path.join(__dirname, '../src/lib/assistant-request.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const loaded = { exports: {} };
new Function('module', 'exports', compiled)(loaded, loaded.exports);
const { prepareAssistantRequest } = loaded.exports;

test('une reprise après coupure conserve la clé de la même question', () => {
  const initial = prepareAssistantRequest(null, null, ' Bonjour ', () => 'one');
  const retry = prepareAssistantRequest(initial, null, 'Bonjour', () => {
    throw new Error('Une reprise ne doit pas créer une nouvelle clé');
  });
  assert.strictEqual(retry, initial);
  assert.equal(retry.message, 'Bonjour');
});

test('une question modifiée après un échec reçoit une nouvelle clé', () => {
  const initial = prepareAssistantRequest(null, null, 'Bonjour', () => 'one');
  const changed = prepareAssistantRequest(
    initial,
    null,
    'Un courrier',
    () => 'two',
  );
  assert.equal(changed.clientMessageId, 'two');
});

test('la même question dans une autre conversation est une nouvelle demande', () => {
  const initial = prepareAssistantRequest(
    null,
    'thread-a',
    'Bonjour',
    () => 'one',
  );
  const changed = prepareAssistantRequest(
    initial,
    'thread-b',
    'Bonjour',
    () => 'two',
  );
  assert.equal(changed.clientMessageId, 'two');
});

test('une nouvelle demande après succès peut répéter le même texte', () => {
  const first = prepareAssistantRequest(null, null, 'Bonjour', () => 'one');
  const next = prepareAssistantRequest(null, null, 'Bonjour', () => 'two');
  assert.notEqual(first.clientMessageId, next.clientMessageId);
});
