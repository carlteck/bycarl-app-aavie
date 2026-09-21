import type { PageResult } from '@/hooks/use-remote-list';
import { safeExternalUrl } from '@/lib/external-url';
import { pageRange, toPage } from '@/lib/paging';
import { markdownToPlainText } from '@/lib/simple-markdown';
import {
  asDay,
  asId,
  asOneOf,
  asOptionalText,
  asRecord,
  asText,
} from '@/lib/remote-values';
import { toIlikePattern } from '@/lib/search-term';
import { supabase } from '@/lib/supabase';

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

const COLUMNS =
  'id, title, description, tag, published_date, source_name, source_url';

export async function fetchNewsPage(
  page: number,
  tag: NewsFilter,
  term: string,
  signal: AbortSignal,
): Promise<PageResult<RegulatoryNews>> {
  let query = supabase
    .from('regulatory_news')
    .select(COLUMNS)
    .order('published_date', { ascending: false })
    .order('id')
    .range(...pageRange(page));
  if (tag !== 'all') query = query.eq('tag', tag);
  const pattern = toIlikePattern(term);
  if (pattern)
    query = query.or(`title.ilike.${pattern},description.ilike.${pattern}`);
  const { data, error } = await query.abortSignal(signal);
  if (error) throw error;
  return toPage(data, mapNews);
}

export async function fetchNews(
  id: string,
  signal: AbortSignal,
): Promise<RegulatoryNews | null> {
  const { data, error } = await supabase
    .from('regulatory_news')
    .select(COLUMNS)
    .eq('id', id)
    .abortSignal(signal)
    .maybeSingle();
  if (error) throw error;
  return mapNews(data);
}
