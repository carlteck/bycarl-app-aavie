const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function deferred() {
  let resolve, reject;
  const promise = new Promise((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
const tick = () => new Promise((resolve) => setImmediate(resolve));
function harness(file, dependencies) {
  let slots = [],
    index = 0,
    scheduled = [],
    cleanups = [],
    mounted = true;
  const react = {
    useState: (value) => {
      const i = index++;
      if (!(i in slots)) slots[i] = value;
      return [
        slots[i],
        (value) => {
          if (!mounted) throw Error('setState après démontage');
          slots[i] = typeof value === 'function' ? value(slots[i]) : value;
        },
      ];
    },
    useRef: (value) => {
      const i = index++;
      return slots[i] ?? (slots[i] = { current: value });
    },
    useCallback: (fn, deps) => {
      const i = index++;
      const prev = slots[i];
      if (!prev || deps.some((d, n) => d !== prev.deps[n]))
        slots[i] = { fn, deps };
      return slots[i].fn;
    },
    useEffect: (effect, deps) => {
      const i = index++;
      const prev = slots[i];
      if (!prev || deps.some((d, n) => d !== prev[n])) {
        slots[i] = deps;
        scheduled.push(() => {
          cleanups[i]?.();
          cleanups[i] = effect();
        });
      }
    },
  };
  const exports = {};
  const modules = {
    ...dependencies,
    react,
    'react/jsx-runtime': {
      jsx: (type, props) => ({ type, props }),
      jsxs: (type, props) => ({ type, props }),
    },
  };
  modules['expo-router'] = {
    useFocusEffect: (fn) => react.useEffect(fn, [fn]),
  };
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    {
      exports,
      require: (name) => {
        if (!(name in modules)) throw Error(name);
        return modules[name];
      },
    },
  );
  return {
    exports,
    render: (fn, ...args) => {
      index = 0;
      return fn(...args);
    },
    commit: () => {
      const effects = scheduled;
      scheduled = [];
      effects.forEach((fn) => fn());
    },
    unmount: () => {
      cleanups.forEach((fn) => fn?.());
      mounted = false;
    },
  };
}
function biometrics() {
  const listeners = new Set();
  const app = {
    currentState: 'active',
    addEventListener: (_event, fn) => {
      listeners.add(fn);
      return { remove: () => listeners.delete(fn) };
    },
  };
  let authenticate = async () => ({ success: true });
  let preference = true;
  let writes = [];
  const h = harness('src/hooks/use-biometric-lock.ts', {
    'expo-local-authentication': {
      hasHardwareAsync: async () => true,
      isEnrolledAsync: async () => true,
      authenticateAsync: () => authenticate(),
    },
    'react-native': { AppState: app, Platform: { OS: 'ios' } },
    '@/lib/session-storage': {
      isBiometricEnabled: async () => preference,
      setBiometricEnabled: async (v) => {
        preference = v;
        writes.push(v);
      },
    },
  });
  return {
    ...h,
    view: (id = 'A') => h.render(h.exports.useBiometricLock, id),
    state: (value) => {
      app.currentState = value;
      listeners.forEach((fn) => fn(value));
    },
    authentication: (fn) => {
      authenticate = fn;
    },
    writes,
  };
}
test('biométrie: lecture du réglage puis déverrouillage et reverrouillage', async () => {
  const h = biometrics();
  assert.equal(h.view().biometricLocked, true);
  h.commit();
  await tick();
  assert.equal(h.view().biometricLocked, true);
  assert.equal(await h.view().confirmBiometrics(), true);
  assert.equal(h.view().biometricLocked, false);
  h.state('inactive');
  assert.equal(h.view().biometricLocked, true);
  h.state('active');
  assert.equal(h.view().biometricLocked, false);
  h.state('background');
  h.state('active');
  assert.equal(h.view().biometricLocked, true);
  h.unmount();
});
test('biométrie: annulation ou exception ne déverrouille pas et ne change pas le réglage', async () => {
  const h = biometrics();
  h.view();
  h.commit();
  await tick();
  h.authentication(async () => ({ success: false }));
  await h.view().toggleBiometrics(false);
  assert.equal(h.writes.length, 0);
  assert.equal(h.view().biometricLocked, true);
  h.authentication(async () => {
    throw Error('native');
  });
  assert.equal(await h.view().confirmBiometrics(), false);
  h.unmount();
});
test('biométrie: résultat tardif ignoré après arrière-plan ou changement de compte', async () => {
  const h = biometrics();
  h.view();
  h.commit();
  await tick();
  let pending = deferred();
  h.authentication(() => pending.promise);
  const result = h.view().confirmBiometrics();
  h.state('background');
  h.state('active');
  pending.resolve({ success: true });
  assert.equal(await result, false);
  pending = deferred();
  const other = h.view().confirmBiometrics();
  h.view('B');
  h.commit();
  pending.resolve({ success: true });
  assert.equal(await other, false);
  assert.equal(h.view('B').biometricLocked, true);
  h.unmount();
});
test('biométrie: confirmation unique et désactivation authentifiée', async () => {
  const h = biometrics();
  h.view();
  h.commit();
  await tick();
  const pending = deferred();
  h.authentication(() => pending.promise);
  const first = h.view().confirmBiometrics();
  assert.equal(await h.view().confirmBiometrics(), false);
  pending.resolve({ success: true });
  await first;
  h.authentication(async () => ({ success: true }));
  await h.view().toggleBiometrics(false);
  assert.deepEqual(h.writes, [false]);
  assert.equal(h.view().biometricLocked, false);
  h.unmount();
});
function dictation(permission) {
  const events = {};
  const errors = [];
  const transcripts = [];
  let starts = 0,
    requests = 0;
  const listeners = new Set();
  const module = {
    requestPermissionsAsync: () => {
      requests++;
      return permission();
    },
    start: () => {
      starts++;
    },
    abort: () => {},
    stop: () => {},
  };
  const h = harness('src/components/dictation-button.tsx', {
    '@expo/vector-icons': { Ionicons: 'Icon' },
    'react-native': {
      Pressable: 'Button',
      AppState: {
        addEventListener: (_e, fn) => {
          listeners.add(fn);
          return { remove: () => listeners.delete(fn) };
        },
      },
    },
    '@/constants/theme': { Palette: {} },
    '@/lib/dictation-permission': {
      requestDictationPermission: async (api, current) => {
        const result = await api.requestPermissionsAsync();
        return !current() ? 'cancelled' : result.granted ? 'granted' : 'denied';
      },
    },
    'expo-speech-recognition': {
      ExpoSpeechRecognitionModule: module,
      useSpeechRecognitionEvent: (name, fn) => {
        events[name] = fn;
      },
    },
  });
  const props = {
    onError: (message) => errors.push(message),
    onTranscript: (text) => transcripts.push(text),
  };
  const wrapper = h.exports.DictationButton(props);
  const view = () => h.render(wrapper.type, props);
  view();
  h.commit();
  return {
    ...h,
    view,
    errors,
    transcripts,
    events,
    starts: () => starts,
    requests: () => requests,
    background: () => listeners.forEach((fn) => fn('background')),
  };
}
test('dictée: permission tardive après démontage ne démarre pas le micro', async () => {
  const pending = deferred();
  const h = dictation(() => pending.promise);
  h.view().props.onPress();
  h.unmount();
  pending.resolve({ granted: true });
  await tick();
  assert.equal(h.starts(), 0);
  assert.equal(h.errors.length, 0);
});
test('dictée: erreur de permission interceptée, nouvelle tentative possible', async () => {
  let fail = true;
  const h = dictation(async () => {
    if (fail) throw Error('native');
    return { granted: true };
  });
  h.view().props.onPress();
  await tick();
  assert.equal(h.errors.length, 1);
  fail = false;
  h.view().props.onPress();
  await tick();
  assert.equal(h.starts(), 1);
  h.unmount();
});
test('dictée: double appui et retour arrière-plan pendant la permission', async () => {
  const pending = deferred();
  const h = dictation(() => pending.promise);
  h.view().props.onPress();
  h.view().props.onPress();
  assert.equal(h.requests(), 1);
  h.background();
  pending.resolve({ granted: true });
  await tick();
  assert.equal(h.starts(), 0);
  h.unmount();
});
test('dictée: résultat accepté pendant la session, ignoré après départ', async () => {
  const h = dictation(async () => ({ granted: true }));
  h.view().props.onPress();
  await tick();
  h.events.result({ results: [{ transcript: 'Bonjour' }] });
  assert.deepEqual(h.transcripts, ['Bonjour']);
  h.unmount();
  h.events.result({ results: [{ transcript: 'Tardif' }] });
  assert.deepEqual(h.transcripts, ['Bonjour']);
});

test('dictée: refus de permission sans démarrage', async () => {
  const h = dictation(async () => ({ granted: false }));
  h.view().props.onPress();
  await tick();
  assert.equal(h.starts(), 0);
  assert.equal(h.errors.length, 1);
  h.unmount();
});
test('dictée: le bouton Arrêter conserve le dernier résultat final', async () => {
  const h = dictation(async () => ({ granted: true }));
  h.view().props.onPress();
  await tick();
  h.view().props.onPress();
  h.events.result({ results: [{ transcript: 'Texte final' }] });
  h.events.end();
  assert.deepEqual(h.transcripts, ['Texte final']);
  h.unmount();
});
