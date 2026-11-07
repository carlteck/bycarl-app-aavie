/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

const filename = path.join(__dirname, '../src/lib/api.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;

function loadApi(siteSession, legacyToken, activeToken = null) {
  const loaded = { exports: {} };
  const mocks = (name) => {
    if (name === './site-auth-storage')
      return { readSiteAuthSession: async () => siteSession };
    if (name === './session-storage')
      return { readSessionToken: async () => legacyToken };
    if (name === './supabase')
      return {
        supabase: {
          auth: {
            getSession: async () => ({
              data: {
                session: activeToken ? { access_token: activeToken } : null,
              },
            }),
          },
        },
      };
    throw new Error(name);
  };
  new Function('module', 'exports', 'require', compiled)(
    loaded,
    loaded.exports,
    mocks,
  );
  return loaded.exports;
}

test('le jeton du site est prioritaire et le signal est transmis', async () => {
  const originalFetch = globalThis.fetch;
  try {
    const signal = new AbortController().signal;
    globalThis.fetch = async (_url, options) => {
      assert.equal(options.headers.Authorization, 'Bearer site-token');
      assert.equal(options.signal, signal);
      return { ok: true, json: async () => ({ balance: 12 }) };
    };
    const { apiFetch } = loadApi({ accessToken: 'site-token' }, 'legacy-token');
    assert.deepEqual(await apiFetch('/credits.php', { signal }), {
      balance: 12,
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('une session Supabase déjà ouverte est transmise à l’assistant', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (_url, options) => {
      assert.equal(options.headers.Authorization, 'Bearer active-session');
      return { ok: true, json: async () => ({ balance: 12 }) };
    };
    const { apiFetch } = loadApi(null, 'stale-legacy', 'active-session');
    await apiFetch('/credits.php');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('sans session, aucune question ne part sans authentification', async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  try {
    globalThis.fetch = async () => {
      calls++;
      throw new Error('Ne doit pas être appelé');
    };
    const { apiFetch } = loadApi(null, null);
    await assert.rejects(
      apiFetch('/ai/chat.php', { method: 'POST' }),
      (error) => error.status === 401,
    );
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('un refus serveur conserve son statut HTTP', async () => {
  const originalFetch = fetch;
  try {
    globalThis.fetch = async () => ({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Session expirée' }),
    });
    const { apiFetch, ApiError } = loadApi(null, null);
    await assert.rejects(
      apiFetch('/credits.php'),
      (error) => error instanceof ApiError && error.status === 401,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
