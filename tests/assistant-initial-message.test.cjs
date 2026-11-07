/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');
const vm = require('node:vm');

function harness() {
  const slots = [];
  const effects = [];
  const timers = new Map();
  let cursor = 0;
  let nextTimer = 0;
  const react = {
    useRef(value) {
      const index = cursor++;
      return slots[index] ?? (slots[index] = { current: value });
    },
    useEffect(setup, deps) {
      const index = cursor++;
      const previous = slots[index];
      if (!previous || deps.some((value, i) => value !== previous.deps[i])) {
        previous?.cleanup?.();
        const effect = { setup, deps, cleanup: undefined };
        slots[index] = effect;
        effects.push(effect);
      }
    },
  };
  const exports = {};
  const filename = path.join(
    __dirname,
    '../src/hooks/use-assistant-initial-message.ts',
  );
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      exports,
      require: (name) => {
        assert.equal(name, 'react');
        return react;
      },
      setTimeout(callback) {
        const id = ++nextTimer;
        timers.set(id, callback);
        return id;
      },
      clearTimeout: (id) => timers.delete(id),
    },
  );
  return {
    render(message, conversationId, send) {
      cursor = 0;
      exports.useAssistantInitialMessage(message, conversationId, send);
      while (effects.length) {
        const effect = effects.shift();
        effect.cleanup = effect.setup();
      }
    },
    strictReplay() {
      for (const effect of slots.filter((value) => value.setup)) {
        effect.cleanup?.();
        effect.cleanup = effect.setup();
      }
    },
    flush() {
      const callbacks = [...timers.values()];
      timers.clear();
      callbacks.forEach((callback) => callback());
    },
    unmount() {
      slots.forEach((slot) => slot.cleanup?.());
    },
  };
}

test('la question envoyée depuis l’accueil part sans deuxième appui', () => {
  const h = harness();
  const messages = [];
  h.render('Mon courrier CAF', null, async (text) => {
    messages.push(text);
  });
  h.flush();
  assert.deepEqual(messages, ['Mon courrier CAF']);
});

test('Strict Mode et les nouveaux rendus ne doublent pas la question', () => {
  const h = harness();
  const messages = [];
  h.render('Bonjour', null, async (text) => {
    messages.push(text);
  });
  h.strictReplay();
  h.flush();
  h.render('', null, async (text) => {
    messages.push(text);
  });
  h.flush();
  assert.deepEqual(messages, ['Bonjour']);
});

test('ouvrir un fil vide ou existant ne déclenche aucun envoi', () => {
  for (const [message, conversationId] of [
    ['', null],
    ['Bonjour', 'existing'],
  ]) {
    const h = harness();
    const messages = [];
    h.render(message, conversationId, async (text) => {
      messages.push(text);
    });
    h.flush();
    assert.deepEqual(messages, []);
  }
});

test('quitter avant le démarrage annule l’envoi automatique', () => {
  const h = harness();
  const messages = [];
  h.render('Bonjour', null, async (text) => {
    messages.push(text);
  });
  h.unmount();
  h.flush();
  assert.deepEqual(messages, []);
});

test('la reconnexion conserve le brouillon sans envoyer un texte non confirmé', () => {
  const filename = path.join(__dirname, '../src/lib/assistant-draft.ts');
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const loaded = { exports: {} };
  new Function('module', 'exports', compiled)(loaded, loaded.exports);
  const draft = loaded.exports;
  draft.setAssistantDraft('Ma question non envoyée', false);
  assert.equal(draft.readAssistantDraft(), 'Ma question non envoyée');
  assert.equal(draft.shouldSendAssistantDraft(), false);
  draft.setAssistantDraft('Ma question déjà envoyée', true);
  assert.equal(draft.shouldSendAssistantDraft(), true);
  draft.clearAssistantDraft();
  assert.equal(draft.readAssistantDraft(), '');
  assert.equal(draft.shouldSendAssistantDraft(), false);
});
