const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename);
};

const siteI18n = path.resolve(__dirname, '../../site_aavie/src/i18n');
const localeCodes = ['fr', 'en', 'es', 'pt', 'ht'];
const source = Object.fromEntries(localeCodes.map((code) => [
  code,
  require(path.join(siteI18n, `${code}.ts`))[code],
]));

function flatten(value, prefix = '', result = {}) {
  for (const [key, entry] of Object.entries(value)) {
    const pathKey = prefix ? `${prefix}.${key}` : key;
    if (typeof entry === 'string') result[pathKey] = entry;
    else if (entry && typeof entry === 'object') flatten(entry, pathKey, result);
  }
  return result;
}

const flat = Object.fromEntries(localeCodes.map((code) => [code, flatten(source[code])]));
const phrases = Object.fromEntries(localeCodes.map((code) => [code, {}]));
const mobileSource = path.join(__dirname, '../src');
const usedFrench = new Set();
function collectMobileStrings(directory) {
  for (const name of fs.readdirSync(directory)) {
    const filename = path.join(directory, name);
    const stat = fs.statSync(filename);
    if (stat.isDirectory()) collectMobileStrings(filename);
    else if (/\.(?:ts|tsx)$/.test(name) && name !== 'site-phrases.generated.ts') {
      const sourceFile = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true,
        name.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
      const visit = (node) => {
        if (ts.isStringLiteralLike(node) || ts.isNoSubstitutionTemplateLiteral(node)) usedFrench.add(node.text.trim());
        if (ts.isJsxText(node)) usedFrench.add(node.text.trim().replace(/\s+/g, ' '));
        ts.forEachChild(node, visit);
      };
      visit(sourceFile);
    }
  }
}
collectMobileStrings(mobileSource);
for (const [key, french] of Object.entries(flat.fr)) {
  if (!usedFrench.has(french)) continue;
  for (const code of localeCodes) phrases[code][french] = flat[code][key] ?? french;
}

const output = `// Généré depuis les dictionnaires versionnés du site AAVIE. Ne pas modifier à la main.\n` +
  `import type { LocaleCode } from '@/constants/locales';\n\n` +
  `export const sitePhrases: Record<LocaleCode, Record<string, string>> = ${JSON.stringify(phrases, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, '../src/i18n/site-phrases.generated.ts'), output);
