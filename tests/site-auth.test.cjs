const { test } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');
const fs = require('node:fs');
const ts = require('typescript');

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

const SITE_AUTH_TS = path.join(__dirname, '..', 'src', 'lib', 'site-auth.ts');
const SITE_AUTH_STORAGE_TS = path.join(
  __dirname,
  '..',
  'src',
  'lib',
  'site-auth-storage.ts',
);

// `react-native` et `expo-secure-store` n'ont pas d'implémentation chargeable sous Node tel
// quel (Flow, modules natifs) : simulés une fois pour tout le fichier, comme `sync.test.cjs` le
// fait déjà pour `expo-sqlite`/`expo-crypto`. L'état est remis à zéro par `resetMocks()` au
// début de chaque test, pour que les appels d'un test ne polluent pas le suivant.
class MockApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
class MockNetworkError extends Error {}

let secureStore;
let calls;
let responses;
let signOutCalls;

function resetMocks() {
  secureStore = new Map();
  calls = [];
  responses = [];
  signOutCalls = 0;
}
resetMocks();

const originalLoad = Module._load;
Module._load = function (id, ...args) {
  if (id === './api')
    return {
      apiFetch: async (urlPath, options) => {
        calls.push({ urlPath, body: JSON.parse(String(options.body)) });
        const next = responses.shift();
        if (next instanceof Error) throw next;
        return (
          next ?? { access_token: 'a', refresh_token: 'r', expires_in: 3600 }
        );
      },
      ApiError: MockApiError,
      NetworkError: MockNetworkError,
    };
  if (id === './supabase')
    return {
      supabase: {
        auth: {
          setSession: async () => ({ error: null }),
          signOut: async () => {
            signOutCalls++;
            return { error: null };
          },
        },
      },
    };
  if (id === 'expo-secure-store')
    return {
      getItemAsync: async (k) => secureStore.get(k) ?? null,
      setItemAsync: async (k, v) => void secureStore.set(k, v),
      deleteItemAsync: async (k) => void secureStore.delete(k),
    };
  if (id === 'react-native')
    return {
      Platform: { OS: 'ios' },
      AppState: { addEventListener: () => ({ remove() {} }) },
    };
  return originalLoad.call(this, id, ...args);
};

/** Module frais à chaque test : `refreshTimer`/`appStateSubscription` repartent de zéro. */
function freshSiteAuth() {
  delete require.cache[SITE_AUTH_TS];
  delete require.cache[SITE_AUTH_STORAGE_TS];
  return require(SITE_AUTH_TS);
}

// --- refreshDelayMs() : logique pure -------------------------------------------------------
test('refreshDelayMs : renouvelle 5 minutes avant expiration', () => {
  resetMocks();
  const { refreshDelayMs } = freshSiteAuth();
  const now = Date.parse('2026-10-10T10:00:00Z');
  const expiresAt = new Date(now + 3600 * 1000).toISOString(); // +1h, comme l'API
  assert.equal(refreshDelayMs(expiresAt, now), 55 * 60 * 1000);
});

test('refreshDelayMs : jamais moins de 30 secondes, même si déjà expiré', () => {
  resetMocks();
  const { refreshDelayMs } = freshSiteAuth();
  const now = Date.parse('2026-10-10T10:00:00Z');
  const expiresAt = new Date(now - 1000).toISOString(); // déjà expiré
  assert.equal(refreshDelayMs(expiresAt, now), 30 * 1000);
});

// --- site-auth-storage.ts : aller-retour ----------------------------------------------------
test('site-auth-storage : écrit, lit et efface une session', async () => {
  resetMocks();
  delete require.cache[SITE_AUTH_STORAGE_TS];
  const mod = require(SITE_AUTH_STORAGE_TS);

  assert.equal(await mod.readSiteAuthSession(), null, 'rien au départ');

  const session = {
    accessToken: 'eyJ.fake.token',
    refreshToken: 'abcdef0123456789',
    expiresAt: '2026-10-10T11:00:00.000Z',
  };
  await mod.writeSiteAuthSession(session);
  assert.deepEqual(await mod.readSiteAuthSession(), session);

  await mod.clearSiteAuthSession();
  assert.equal(
    await mod.readSiteAuthSession(),
    null,
    'effacée après clearSiteAuthSession()',
  );
});

test('site-auth-storage : une valeur stockée corrompue est ignorée, pas levée', async () => {
  resetMocks();
  secureStore.set('aavie_site_auth_session', '{"ceci":"nest pas une session"}');
  delete require.cache[SITE_AUTH_STORAGE_TS];
  const { readSiteAuthSession } = require(SITE_AUTH_STORAGE_TS);
  assert.equal(await readSiteAuthSession(), null);
});

// --- site-auth.ts : orchestration -----------------------------------------------------------
test('signInWithSite : appelle mobile-auth.php et pose la session', async () => {
  resetMocks();
  const { signInWithSite } = freshSiteAuth();
  await signInWithSite('a@b.fr', 'motdepasse');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].urlPath, '/mobile-auth.php');
  assert.deepEqual(calls[0].body, { email: 'a@b.fr', password: 'motdepasse' });
});

test('refreshSiteSession : sans session stockée, ne fait rien et renvoie false', async () => {
  resetMocks();
  const { refreshSiteSession } = freshSiteAuth();
  assert.equal(await refreshSiteSession(), false);
  assert.equal(
    calls.length,
    0,
    'aucun appel réseau sans jeton de renouvellement',
  );
});

test('refreshSiteSession : avec une session stockée, appelle mobile-auth-refresh.php', async () => {
  resetMocks();
  const { signInWithSite, refreshSiteSession } = freshSiteAuth();
  await signInWithSite('a@b.fr', 'x');
  calls.length = 0;
  const ok = await refreshSiteSession();
  assert.equal(ok, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].urlPath, '/mobile-auth-refresh.php');
  assert.deepEqual(calls[0].body, { refresh_token: 'r' });
});

test('refreshSiteSession : un jeton refusé (401) referme la session plutôt que de réessayer', async () => {
  resetMocks();
  const { signInWithSite, refreshSiteSession } = freshSiteAuth();
  await signInWithSite('a@b.fr', 'x');
  responses.push(new MockApiError('Session expirée. Reconnectez-vous.', 401));
  const ok = await refreshSiteSession();
  assert.equal(ok, false);
  assert.equal(signOutCalls, 1, 'la session Supabase locale est fermée');
});

test('refreshSiteSession : une panne réseau garde la session, ne la referme pas', async () => {
  resetMocks();
  const { signInWithSite, refreshSiteSession } = freshSiteAuth();
  await signInWithSite('a@b.fr', 'x');
  responses.push(new MockNetworkError());
  const ok = await refreshSiteSession();
  assert.equal(ok, true, 'une panne réseau n’est pas un rejet de session');
  assert.equal(signOutCalls, 0);
});

test('restoreSiteSession : sans session stockée, renvoie false sans appel réseau', async () => {
  resetMocks();
  const { restoreSiteSession } = freshSiteAuth();
  assert.equal(await restoreSiteSession(), false);
  assert.equal(calls.length, 0);
});

test('restoreSiteSession : jeton encore valable, reprend sans appel réseau', async () => {
  resetMocks();
  const { signInWithSite, restoreSiteSession } = freshSiteAuth();
  await signInWithSite('a@b.fr', 'x'); // expire dans 1h (mock)
  calls.length = 0;
  const ok = await restoreSiteSession();
  assert.equal(ok, true);
  assert.equal(
    calls.length,
    0,
    'un jeton encore largement valable ne redemande rien',
  );
});

test('restoreSiteSession : jeton expiré, se rabat sur un renouvellement', async () => {
  resetMocks();
  const { signInWithSite, restoreSiteSession } = freshSiteAuth();
  responses.push({ access_token: 'a', refresh_token: 'r', expires_in: -10 });
  await signInWithSite('a@b.fr', 'x');
  calls.length = 0;
  const ok = await restoreSiteSession();
  assert.equal(ok, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].urlPath, '/mobile-auth-refresh.php');
});

test('signOutSite : efface la session stockée et ferme la session Supabase locale', async () => {
  resetMocks();
  const { signInWithSite, signOutSite, restoreSiteSession } = freshSiteAuth();
  await signInWithSite('a@b.fr', 'x');
  await signOutSite();
  assert.equal(signOutCalls, 1);
  assert.equal(
    await restoreSiteSession(),
    false,
    'plus rien à reprendre après la déconnexion',
  );
});
