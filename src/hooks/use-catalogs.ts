import { useCallback } from 'react';

import { useRemoteList } from '@/hooks/use-remote-list';
import { useRemoteResource } from '@/hooks/use-remote-resource';
import { fetchAnnuaire } from '@/lib/annuaire-remote';
import { fetchManual, fetchManualArticle } from '@/lib/manual';
import {
  fetchNews,
  fetchNewsPage,
  type NewsFilter,
  type RegulatoryNews,
} from '@/lib/regulatory-news';
import {
  fetchResource,
  fetchResourceCategories,
  fetchResourcesPage,
  type Resource,
} from '@/lib/resources';

const newsKey = (item: RegulatoryNews) => item.id;
const resourceKey = (item: Resource) => item.id;

export function useRegulatoryNews(tag: NewsFilter, term: string) {
  const fetchPage = useCallback(
    (page: number, signal: AbortSignal) =>
      fetchNewsPage(page, tag, term, signal),
    [tag, term],
  );
  return useRemoteList(fetchPage, newsKey);
}

export function useRegulatoryNewsItem(id: string) {
  const load = useCallback(
    (signal: AbortSignal) => fetchNews(id, signal),
    [id],
  );
  return useRemoteResource(load);
}

export function useResources(category: string | null, term: string) {
  const fetchPage = useCallback(
    (page: number, signal: AbortSignal) =>
      fetchResourcesPage(page, category, term, signal),
    [category, term],
  );
  return useRemoteList(fetchPage, resourceKey);
}

export function useResource(id: string) {
  const load = useCallback(
    (signal: AbortSignal) => fetchResource(id, signal),
    [id],
  );
  return useRemoteResource(load);
}

export function useResourceCategories() {
  return useRemoteResource(fetchResourceCategories);
}

export function useAnnuaire() {
  return useRemoteResource(fetchAnnuaire);
}

export function useManual() {
  return useRemoteResource(fetchManual);
}

export function useManualArticle(id: string) {
  const load = useCallback(
    (signal: AbortSignal) => fetchManualArticle(id, signal),
    [id],
  );
  return useRemoteResource(load);
}
