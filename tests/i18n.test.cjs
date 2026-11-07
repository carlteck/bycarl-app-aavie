const { test } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');
const fs = require('node:fs');
const ts = require('typescript');

const src = path.join(__dirname, '..', 'src');
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith('@/')) request = path.join(src, request.slice(2));
  return originalResolve.call(this, request, ...rest);
};
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename);
};

const { dictionaries, fr } = require(path.join(src, 'i18n', 'messages.ts'));
const { sitePhrases } = require(path.join(src, 'i18n', 'site-phrases.generated.ts'));
const { mobilePhrases } = require(path.join(src, 'i18n', 'mobile-phrases.ts'));
const { LOCALES, normalizeLocale } = require(path.join(src, 'constants', 'locales.ts'));

test('i18n : toutes les langues ont exactement les clés françaises', () => {
  const reference = Object.keys(fr).sort();
  for (const locale of LOCALES) {
    assert.deepEqual(Object.keys(dictionaries[locale.code]).sort(), reference, locale.code);
  }
});

test('i18n : les phrases partagées avec le site ont la même parité', () => {
  const reference = Object.keys(sitePhrases.fr).sort();
  for (const locale of LOCALES) {
    assert.deepEqual(Object.keys(sitePhrases[locale.code]).sort(), reference, locale.code);
  }
});

test('i18n : les phrases propres au mobile ont la même parité', () => {
  const reference = Object.keys(mobilePhrases.fr).sort();
  for (const locale of LOCALES) {
    assert.deepEqual(Object.keys(mobilePhrases[locale.code]).sort(), reference, locale.code);
  }
});

test('i18n : le créole haïtien remplace le code et le drapeau guyanais', () => {
  const haitian = LOCALES.find((locale) => locale.code === 'ht');
  assert.equal(haitian.flag, '🇭🇹');
  assert.equal(LOCALES.some((locale) => locale.code === 'gcr'), false);
  assert.equal(normalizeLocale('gcr'), 'ht');
  assert.equal(normalizeLocale('inconnue'), 'fr');
});
