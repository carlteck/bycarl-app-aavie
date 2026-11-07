import type { PageResult } from '@/hooks/use-remote-list';
import { apiFetch } from '@/lib/api';
import { safeExternalUrl } from '@/lib/external-url';
import { PAGE_SIZE } from '@/lib/paging';
import { markdownToPlainText } from '@/lib/simple-markdown';
import {
  asDay,
  asId,
  asOneOf,
  asOptionalText,
  asRecord,
  asText,
} from '@/lib/remote-values';

export const NEWS_TAGS = [
  'Guyane',
  'Outre-mer',
  'National',
  'Handicap',
] as const;
export type NewsTag = (typeof NEWS_TAGS)[number];
export type NewsFilter = NewsTag | 'all';

export type RegulatoryNews = {
  id: string;
  title: string;
  description: string;
  /** Début de l'article en texte brut, calculé une fois à la lecture (pas à chaque rendu). */
  excerpt: string;
  tag: NewsTag;
  /** `AAAA-MM-JJ`. */
  publishedDate: string;
  sourceName?: string;
  /** Uniquement un lien `https:` valide : les autres sont écartés à la lecture. */
  sourceUrl?: string;
};

export function mapNews(row: unknown): RegulatoryNews | null {
  const value = asRecord(row);
  if (!value) return null;
  const id = asId(value.id);
  const title = asText(value.title);
  const tag = asOneOf(value.tag, NEWS_TAGS);
  const publishedDate = asDay(value.published_date);
  if (!id || !title || !tag || !publishedDate) return null;
  return {
    id,
    title,
    tag,
    publishedDate,
    description: asText(value.description),
    excerpt: markdownToPlainText(asText(value.description)).slice(0, 240),
    sourceName: asOptionalText(value.source_name),
    sourceUrl: safeExternalUrl(value.source_url) ?? undefined,
  };
}

export async function fetchNewsPage(
  page: number,
  tag: NewsFilter,
  term: string,
  signal: AbortSignal,
): Promise<PageResult<RegulatoryNews>> {
  const payload = await apiFetch<unknown>('/news.php', { signal });
  const rows = asRecord(payload)?.news;
  const query = term.trim().toLocaleLowerCase('fr');
  const items = (Array.isArray(rows) ? rows : [])
    .map(mapNews)
    .filter((item): item is RegulatoryNews => item !== null)
    .filter((item) => tag === 'all' || item.tag === tag)
    .filter((item) =>
      query ? `${item.title} ${item.description}`.toLocaleLowerCase('fr').includes(query) : true,
    );
  const start = page * PAGE_SIZE;
  return { items: items.slice(start, start + PAGE_SIZE), hasMore: items.length > start + PAGE_SIZE };
}

export async function fetchNews(
  id: string,
  signal: AbortSignal,
): Promise<RegulatoryNews | null> {
  const first = await fetchNewsPage(0, 'all', '', signal);
  return first.items.find((item) => item.id === id) ?? null;
}
