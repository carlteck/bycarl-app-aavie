import type { PageResult } from '@/hooks/use-remote-list';
import { safeExternalUrl } from '@/lib/external-url';
import { pageRange, toPage } from '@/lib/paging';
import { asId, asOptionalText, asRecord, asText } from '@/lib/remote-values';
import { toIlikePattern } from '@/lib/search-term';
import { supabase } from '@/lib/supabase';

export type Resource = {
  id: string;
  title: string;
  category: string;
  description: string;
  /** Markdown, rendu par `RichText`. */
  content?: string;
  url?: string;
  durationLabel?: string;
};

export function mapResource(row: unknown): Resource | null {
  const value = asRecord(row);
  if (!value) return null;
  const id = asId(value.id);
  const title = asText(value.title);
  const category = asText(value.category);
  if (!id || !title || !category) return null;
  return {
    id,
    title,
    category,
    description: asText(value.description),
    content: asOptionalText(value.content),
    url: safeExternalUrl(value.url) ?? undefined,
    durationLabel: asOptionalText(value.duration_label),
  };
}

const COLUMNS =
  'id, title, category, description, content, url, duration_label';

export async function fetchResourcesPage(
  page: number,
  category: string | null,
  term: string,
  signal: AbortSignal,
): Promise<PageResult<Resource>> {
  let query = supabase
    .from('resources')
    .select(COLUMNS)
    .order('title')
    .order('id')
    .range(...pageRange(page));
  if (category) query = query.eq('category', category);
  const pattern = toIlikePattern(term);
  if (pattern)
    query = query.or(`title.ilike.${pattern},description.ilike.${pattern}`);
  const { data, error } = await query.abortSignal(signal);
  if (error) throw error;
  return toPage(data, mapResource);
}

export async function fetchResource(
  id: string,
  signal: AbortSignal,
): Promise<Resource | null> {
  const { data, error } = await supabase
    .from('resources')
    .select(COLUMNS)
    .eq('id', id)
    .abortSignal(signal)
    .maybeSingle();
  if (error) throw error;
  return mapResource(data);
}

/** Catégories distinctes : le catalogue est petit, une lecture des seules catégories suffit. */
export async function fetchResourceCategories(
  signal: AbortSignal,
): Promise<string[]> {
  const { data, error } = await supabase
    .from('resources')
    .select('category')
    .limit(1000)
    .abortSignal(signal);
  if (error) throw error;
  const names = ((data ?? []) as unknown[])
    .map((row) => asText(asRecord(row)?.category))
    .filter(Boolean);
  return [...new Set(names)].sort((a, b) => a.localeCompare(b, 'fr'));
}
