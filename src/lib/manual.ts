import { asId, asOptionalText, asRecord, asText } from '@/lib/remote-values';
import type { LocaleCode } from '@/constants/locales';
import { siteManual } from '@/i18n/site-manual.generated';

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

/** Le site reste la source éditoriale : le générateur embarque ses neuf fiches et traductions. */
export async function fetchManual(
  locale: LocaleCode,
  signal: AbortSignal,
): Promise<ManualSection[]> {
  if (signal.aborted) return [];
  return siteManual[locale].map((section) => ({
    id: section.id,
    title: section.title,
    icon: section.icon,
    articles: section.articles.map((article) => ({
      id: article.id,
      title: article.title,
      summary: article.summary,
    })),
  }));
}

export async function fetchManualArticle(
  id: string,
  locale: LocaleCode,
  signal: AbortSignal,
): Promise<ManualArticle | null> {
  if (signal.aborted) return null;
  for (const section of siteManual[locale]) {
    const article = section.articles.find((item) => item.id === id);
    if (article) return { ...article, sectionTitle: section.title };
  }
  return null;
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
