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
    else if (/\.(?:ts|tsx)$/.test(name) && !name.endsWith('.generated.ts')) {
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

const manualGroups = [
  { key: 'catSpace', icon: 'home-outline', journeys: [1] },
  { key: 'catHelp', icon: 'chatbubbles-outline', journeys: [2] },
  { key: 'catOrg', icon: 'calendar-outline', journeys: [3, 4, 5] },
  { key: 'catAccount', icon: 'person-circle-outline', journeys: [6, 8] },
  { key: 'catInform', icon: 'book-outline', journeys: [7] },
  { key: 'catNeedHelp', icon: 'help-circle-outline', journeys: [9] },
];
const uuid = (kind, value) =>
  `${kind === 'section' ? '10000000' : '20000000'}-0000-4000-8000-${String(value).padStart(12, '0')}`;
const markdown = (value) => String(value ?? '')
  .replace(/<strong>/g, '**')
  .replace(/<\/strong>/g, '**')
  .replace(/<[^>]+>/g, '')
  .trim();
const stepCounts = { 1: 4, 2: 6, 3: 4, 4: 3, 5: 4, 6: 4, 7: 4, 8: 4, 9: 5 };
const manuals = Object.fromEntries(localeCodes.map((code) => {
  const manual = source[code].manual;
  return [code, manualGroups.map((group, groupIndex) => ({
    id: uuid('section', groupIndex + 1),
    title: manual[group.key],
    icon: group.icon,
    articles: group.journeys.map((journey) => {
      const prefix = `j${journey}`;
      const steps = Array.from({ length: stepCounts[journey] }, (_, index) =>
        `${index + 1}. ${markdown(manual[`${prefix}Step${index + 1}`])}`,
      );
      const note = markdown(manual[`${prefix}Note`]);
      return {
        id: uuid('article', journey),
        title: manual[`${prefix}Title`],
        summary: manual[`${prefix}Desc`],
        body: [...steps, ...(note ? [`> ${note}`] : [])].join('\n\n'),
      };
    }),
  }))];
}));
const manualOutput = `// Généré depuis le manuel et les dictionnaires versionnés du site AAVIE. Ne pas modifier à la main.\n` +
  `import type { LocaleCode } from '@/constants/locales';\n\n` +
  `export type GeneratedManualSection = { id: string; title: string; icon: string; articles: { id: string; title: string; summary: string; body: string }[] };\n\n` +
  `export const siteManual: Record<LocaleCode, GeneratedManualSection[]> = ${JSON.stringify(manuals, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, '../src/i18n/site-manual.generated.ts'), manualOutput);
