import { safeExternalUrl } from './external-url';

/**
 * Markdown minimal, restitué en composants natifs — jamais en HTML.
 *
 * Les contenus (ressources, manuel) sont rédigés dans l'administration en Markdown. Aucune
 * bibliothèque n'est embarquée : `marked` + `DOMPurify` sont des outils du navigateur, et un
 * moteur complet ajouterait une dépendance native-compatible à vérifier pour quelques titres,
 * listes et mises en gras. Comme le rendu passe par `<Text>`, il n'existe aucune injection de
 * balises à assainir : ce qui n'est pas reconnu s'affiche en texte brut. Seuls les liens `https:`
 * sont actifs (`safeExternalUrl`).
 *
 * Reconnu : titres `#`–`###`, paragraphes, listes à puces et numérotées, citations, filet, gras,
 * italique, code en ligne (rendu en texte simple), liens. Les tableaux et blocs de code sont
 * dégradés en lignes de texte plutôt qu'ignorés : mieux vaut une information lisible qu'absente.
 */
export type Inline = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  href?: string;
};

export type MarkdownBlock =
  | { type: 'heading'; level: 1 | 2 | 3; inline: Inline[] }
  | { type: 'paragraph'; inline: Inline[] }
  | { type: 'list'; ordered: boolean; items: Inline[][] }
  | { type: 'quote'; inline: Inline[] }
  | { type: 'rule' };

/** Borne de sécurité : un contenu démesuré ne doit pas figer le rendu. */
const MAX_SOURCE_LENGTH = 60_000;

export function parseInline(source: string): Inline[] {
  const result: Inline[] = [];
  const pattern =
    /\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*|\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`/g;
  let last = 0;
  for (let match = pattern.exec(source); match; match = pattern.exec(source)) {
    if (match.index > last)
      result.push({ text: source.slice(last, match.index) });
    if (match[1] !== undefined) result.push({ text: match[1], bold: true });
    else if (match[2] !== undefined)
      result.push({ text: match[2], italic: true });
    else if (match[3] !== undefined) {
      const href = safeExternalUrl(match[4]);
      result.push(href ? { text: match[3], href } : { text: match[3] });
    } else result.push({ text: match[5] });
    last = pattern.lastIndex;
  }
  if (last < source.length) result.push({ text: source.slice(last) });
  return result;
}

export function parseMarkdown(input: string): MarkdownBlock[] {
  const lines = input
    .slice(0, MAX_SOURCE_LENGTH)
    .replace(/\r\n?/g, '\n')
    .split('\n');
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];
  let quote: string[] = [];
  let list: { ordered: boolean; items: Inline[][] } | null = null;
  let fenced = false;

  const flush = () => {
    if (paragraph.length)
      blocks.push({
        type: 'paragraph',
        inline: parseInline(paragraph.join(' ')),
      });
    if (quote.length)
      blocks.push({ type: 'quote', inline: parseInline(quote.join(' ')) });
    if (list) blocks.push({ type: 'list', ...list });
    paragraph = [];
    quote = [];
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^\s*```/.test(line)) {
      flush();
      fenced = !fenced;
      continue;
    }
    if (fenced) {
      if (line.trim())
        blocks.push({ type: 'paragraph', inline: [{ text: line }] });
      continue;
    }
    if (line.trim() === '') {
      flush();
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      blocks.push({
        type: 'heading',
        level: Math.min(heading[1].length, 3) as 1 | 2 | 3,
        inline: parseInline(heading[2].replace(/\s+#+\s*$/, '')),
      });
      continue;
    }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      flush();
      blocks.push({ type: 'rule' });
      continue;
    }
    const bullet = /^\s*[-*+]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      if (
        paragraph.length ||
        quote.length ||
        (list && list.ordered !== ordered)
      )
        flush();
      list ??= { ordered, items: [] };
      list.items.push(parseInline((bullet ?? numbered)![1]));
      continue;
    }
    const quoted = /^>\s?(.*)$/.exec(line);
    if (quoted) {
      if (paragraph.length || list) flush();
      quote.push(quoted[1]);
      continue;
    }
    if (/^\s*\|.*\|\s*$/.test(line)) {
      flush();
      if (/^[\s|:-]+$/.test(line)) continue;
      const cells = line
        .trim()
        .replace(/^\||\|$/g, '')
        .split('|')
        .map((cell) => cell.trim())
        .filter(Boolean);
      if (cells.length)
        blocks.push({
          type: 'paragraph',
          inline: parseInline(cells.join(' · ')),
        });
      continue;
    }
    if (list || quote.length) flush();
    paragraph.push(line.trim());
  }
  flush();
  return blocks;
}

/** Texte brut d'un contenu Markdown (extrait de liste, recherche). */
export function markdownToPlainText(input: string): string {
  return parseMarkdown(input)
    .map((block) => {
      if (block.type === 'rule') return '';
      if (block.type === 'list')
        return block.items
          .map((item) => item.map((part) => part.text).join(''))
          .join(' ');
      return block.inline.map((part) => part.text).join('');
    })
    .filter(Boolean)
    .join(' ');
}
