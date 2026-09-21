import type { PageResult } from '@/hooks/use-remote-list';

export const PAGE_SIZE = 20;

/**
 * Plage PostgREST d'une page. On demande UNE ligne de plus que la page : sa présence dit qu'il en
 * reste, sans requête de comptage supplémentaire.
 */
export function pageRange(page: number): [number, number] {
  return [page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE];
}

/** Valide chaque ligne (celles inexploitables sont écartées) et coupe la ligne « témoin ». */
export function toPage<T>(
  rows: unknown,
  map: (row: unknown) => T | null,
): PageResult<T> {
  const list = Array.isArray(rows) ? (rows as unknown[]) : [];
  return {
    hasMore: list.length > PAGE_SIZE,
    items: list
      .slice(0, PAGE_SIZE)
      .map(map)
      .filter((item): item is T => item !== null),
  };
}
