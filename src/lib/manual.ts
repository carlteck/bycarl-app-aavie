import { asId, asOptionalText, asRecord, asText } from '@/lib/remote-values';
import { supabase } from '@/lib/supabase';

export type ManualArticleSummary = {
  id: string;
  title: string;
  summary?: string;
};

export type ManualSection = {
  id: string;
  title: string;
  summary?: string;
  /** Nom d'icône Ionicons ; validé par l'écran (repli si inconnu). */
  icon?: string;
  articles: ManualArticleSummary[];
};

export type ManualArticle = {
  id: string;
  title: string;
  summary?: string;
  body: string;
  sectionTitle?: string;
};

function mapArticleSummary(row: unknown): ManualArticleSummary | null {
  const value = asRecord(row);
  if (!value) return null;
  const id = asId(value.id);
  const title = asText(value.title);
  if (!id || !title) return null;
  return { id, title, summary: asOptionalText(value.summary) };
}

export function mapSection(row: unknown): ManualSection | null {
  const value = asRecord(row);
  if (!value) return null;
  const id = asId(value.id);
  const title = asText(value.title);
  if (!id || !title) return null;
  const articles = Array.isArray(value.mobile_manual_articles)
    ? (value.mobile_manual_articles as unknown[])
        .map(mapArticleSummary)
        .filter((item): item is ManualArticleSummary => item !== null)
    : [];
  return {
    id,
    title,
    summary: asOptionalText(value.summary),
    icon: asOptionalText(value.icon),
    articles,
  };
}

export function mapArticle(row: unknown): ManualArticle | null {
  const value = asRecord(row);
  if (!value) return null;
  const id = asId(value.id);
  const title = asText(value.title);
  const body = asText(value.body);
  if (!id || !title || !body) return null;
  return {
    id,
    title,
    body,
    summary: asOptionalText(value.summary),
    sectionTitle: asOptionalText(asRecord(value.mobile_manual_sections)?.title),
  };
}

/**
 * Tout le manuel en une requête (sections + titres d'articles) : quelques dizaines de lignes,
 * sommaire et recherche se font ensuite sans réseau. Les chapitres sans article publié sont
 * masqués — un chapitre vide donnerait l'impression d'une page cassée.
 */
export async function fetchManual(
  signal: AbortSignal,
): Promise<ManualSection[]> {
  const { data, error } = await supabase
    .from('mobile_manual_sections')
    .select(
      'id, title, summary, icon, position, mobile_manual_articles(id, title, summary, position)',
    )
    .order('position')
    .order('title')
    .order('position', { referencedTable: 'mobile_manual_articles' })
    .limit(200)
    .abortSignal(signal);
  if (error) throw error;
  return ((data ?? []) as unknown[])
    .map(mapSection)
    .filter((section): section is ManualSection => section !== null)
    .filter((section) => section.articles.length > 0);
}

export async function fetchManualArticle(
  id: string,
  signal: AbortSignal,
): Promise<ManualArticle | null> {
  const { data, error } = await supabase
    .from('mobile_manual_articles')
    .select('id, title, summary, body, mobile_manual_sections(title)')
    .eq('id', id)
    .abortSignal(signal)
    .maybeSingle();
  if (error) throw error;
  return mapArticle(data);
}

/** Articles dont le titre ou le résumé contient tous les mots saisis (sans accents ni casse). */
export function searchManual(
  sections: readonly ManualSection[],
  term: string,
): { article: ManualArticleSummary; sectionTitle: string }[] {
  const words = normalize(term).split(' ').filter(Boolean);
  if (words.length === 0) return [];
  const hits: { article: ManualArticleSummary; sectionTitle: string }[] = [];
  for (const section of sections)
    for (const article of section.articles) {
      const haystack = normalize(`${article.title} ${article.summary ?? ''}`);
      if (words.every((word) => haystack.includes(word)))
        hits.push({ article, sectionTitle: section.title });
    }
  return hits;
}

export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
