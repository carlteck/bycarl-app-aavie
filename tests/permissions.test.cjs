const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const moduleExports = {};
vm.runInNewContext(
  ts.transpileModule(
    fs.readFileSync('src/lib/dictation-permission.ts', 'utf8'),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    },
  ).outputText,
  { exports: moduleExports },
);
const { requestDictationPermission } = moduleExports;
for (const [existing, requested, expected, count] of [
  [{ granted: true, canAskAgain: true }, null, 'granted', 0],
  [{ granted: false, canAskAgain: false }, null, 'blocked', 0],
  [
    { granted: false, canAskAgain: true },
    { granted: true, canAskAgain: true },
    'granted',
    1,
  ],
  [
    { granted: false, canAskAgain: true },
    { granted: false, canAskAgain: true },
    'denied',
    1,
  ],
  [
    { granted: false, canAskAgain: true },
    { granted: false, canAskAgain: false },
    'blocked',
    1,
  ],
]) {
  test(`permission ${JSON.stringify(existing)} → ${expected}`, async () => {
    let calls = 0;
    const result = await requestDictationPermission(
      {
        getPermissionsAsync: async () => existing,
        requestPermissionsAsync: async () => {
          calls++;
          return requested;
        },
      },
      () => true,
    );
    assert.equal(result, expected);
    assert.equal(calls, count);
  });
}
for (const stage of ['status', 'prompt']) {
  test(`permission annulée pendant ${stage}`, async () => {
    let active = true;
    let calls = 0;
    const result = await requestDictationPermission(
      {
        getPermissionsAsync: async () => {
          if (stage === 'status') active = false;
          return { granted: false, canAskAgain: true };
        },
        requestPermissionsAsync: async () => {
          calls++;
          active = false;
          return { granted: true, canAskAgain: true };
        },
      },
      () => active,
    );
    assert.equal(result, 'cancelled');
    assert.equal(calls, stage === 'status' ? 0 : 1);
  });
}
test('erreur native transmise au gestionnaire de l’écran', async () => {
  await assert.rejects(
    requestDictationPermission(
      {
        getPermissionsAsync: async () => {
          throw new Error('native');
        },
        requestPermissionsAsync: async () => assert.fail('unexpected request'),
      },
      () => true,
    ),
    /native/,
  );
});
