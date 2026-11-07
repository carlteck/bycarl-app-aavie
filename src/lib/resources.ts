import type { PageResult } from '@/hooks/use-remote-list';
import { apiFetch } from '@/lib/api';
import { safeExternalUrl } from '@/lib/external-url';
import { PAGE_SIZE } from '@/lib/paging';
import { asId, asOptionalText, asRecord, asText } from '@/lib/remote-values';

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

export async function fetchResourcesPage(
  page: number,
  category: string | null,
  term: string,
  signal: AbortSignal,
): Promise<PageResult<Resource>> {
  const payload = await apiFetch<unknown>('/resources.php', { signal });
  const rows = asRecord(payload)?.resources;
  const query = term.trim().toLocaleLowerCase('fr');
  const items = (Array.isArray(rows) ? rows : [])
    .map(mapResource)
    .filter((item): item is Resource => item !== null)
    .filter((item) => !category || item.category === category)
    .filter((item) => query ? `${item.title} ${item.description}`.toLocaleLowerCase('fr').includes(query) : true);
  const start = page * PAGE_SIZE;
  return { items: items.slice(start, start + PAGE_SIZE), hasMore: items.length > start + PAGE_SIZE };
}

export async function fetchResource(
  id: string,
  signal: AbortSignal,
): Promise<Resource | null> {
  const payload = await apiFetch<unknown>('/resources.php', { signal });
  const rows = asRecord(payload)?.resources;
  return (Array.isArray(rows) ? rows : []).map(mapResource).find((item) => item?.id === id) ?? null;
}

/** Catégories distinctes : le catalogue est petit, une lecture des seules catégories suffit. */
export async function fetchResourceCategories(
  signal: AbortSignal,
): Promise<string[]> {
  const payload = await apiFetch<unknown>('/resources.php', { signal });
  const rows = asRecord(payload)?.resources;
  const names = (Array.isArray(rows) ? rows : [])
    .map((row) => asText(asRecord(row)?.category))
    .filter(Boolean);
  return [...new Set(names)].sort((a, b) => a.localeCompare(b, 'fr'));
}
