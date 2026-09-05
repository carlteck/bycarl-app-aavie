const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup(initialURL) {
  const effects = [];
  const notifications = [];
  const exports = {};
  const react = {
    useRef: (value) => ({ current: value }),
    useCallback: (callback) => callback,
    useEffect: (effect) => effects.push(effect),
  };
  const dependencies = {
    react,
    'react-native': { Linking: {} },
    'expo-linking': {},
    './extractPathFromURL': {
      extractExpoPathFromURL: (_prefixes, url) => url.replace('aavie://', '/'),
    },
    '../react-navigation/native': {
      useNavigationIndependentTree: () => false,
      getStateFromPath: (path) => ({ path }),
    },
  };
  const source = fs.readFileSync(
    require.resolve('expo-router/build/fork/useLinking.native.js'),
    'utf8',
  );
  vm.runInNewContext(source, {
    exports,
    require: (name) => {
      if (!(name in dependencies)) throw Error(`Unexpected import: ${name}`);
      return dependencies[name];
    },
    process: { env: { NODE_ENV: 'production' } },
  });
  const hook = exports.useLinking(
    { current: null },
    {
      prefixes: ['aavie://'],
      getInitialURL: () => initialURL,
      subscribe: () => () => {},
    },
    (path) => notifications.push(path),
  );
  return {
    ...hook,
    notifications,
    mount: () => {
      const cleanups = effects.map((effect) => effect());
      return () => cleanups.forEach((cleanup) => cleanup?.());
    },
  };
}

test('lien initial résolu avant montage : état conservé, notification différée', async () => {
  const hook = setup(Promise.resolve('aavie://planificateur'));
  const state = await hook.getInitialState();
  assert.equal(state.path, '/planificateur');
  assert.deepEqual(hook.notifications, []);
  const unmount = hook.mount();
  assert.deepEqual(hook.notifications, ['/planificateur']);
  unmount();
});
test('lien synchrone : aucune mise à jour pendant le rendu', async () => {
  const hook = setup('aavie://accueil');
  const state = await hook.getInitialState();
  assert.equal(state.path, '/accueil');
  assert.deepEqual(hook.notifications, []);
  hook.mount()();
  assert.deepEqual(hook.notifications, ['/accueil']);
});
test('réponse après démontage : aucune mise à jour tardive', async () => {
  let resolve;
  const hook = setup(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const result = hook.getInitialState();
  hook.mount()();
  resolve('aavie://accueil');
  await result;
  assert.deepEqual(hook.notifications, []);
});
test('réponse après montage : notification normale du lien', async () => {
  let resolve;
  const hook = setup(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const result = hook.getInitialState();
  const unmount = hook.mount();
  resolve('aavie://profil');
  await result;
  assert.deepEqual(hook.notifications, ['/profil']);
  unmount();
});
test('rendu abandonné : aucun setter appelé', async () => {
  const hook = setup(Promise.resolve('aavie://accueil'));
  await hook.getInitialState();
  assert.deepEqual(hook.notifications, []);
});
