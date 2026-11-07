import { apiFetch } from '@/lib/api';
import type { LegalDocumentType } from '@/constants/legal';
import { asInstant, asRecord, asText } from '@/lib/remote-values';

/**
 * Identifiants des deux textes légaux ACTIFS au moment de l'inscription, lus sur `/legal.php`
 * (déjà public, utilisé par le site pour sa propre page de connexion légale). L'inscription
 * unifiée (`mobile-register.php`) revalide ces identifiants côté serveur, exactement comme
 * `register.php` : accepter n'importe quel identifiant laisserait un compte se créer avec un
 * consentement qui ne correspond à aucune version réellement publiée.
 */
export type ActiveConsentDocuments = {
  privacyDocumentId: string | null;
  termsDocumentId: string | null;
};

type RawDocument = { id: unknown; document_type: unknown };

function asDocuments(value: unknown): RawDocument[] {
  const list = (value as { documents?: unknown })?.documents;
  return Array.isArray(list) ? (list as RawDocument[]) : [];
}

export async function fetchActiveConsentDocuments(): Promise<ActiveConsentDocuments> {
  const data = await apiFetch<unknown>('/legal.php');
  const documents = asDocuments(data);
  const find = (type: string) => {
    const match = documents.find((doc) => doc.document_type === type);
    return typeof match?.id === 'string' ? match.id : null;
  };
  return {
    privacyDocumentId: find('privacy_policy'),
    termsDocumentId: find('terms'),
  };
}

export type LegalDocument = {
  id: string;
  type: LegalDocumentType;
  version: string;
  title: string;
  content: string;
  publishedAt?: string;
};

const LEGAL_TYPES: readonly LegalDocumentType[] = [
  'privacy_policy',
  'terms',
  'terms_of_sale',
  'legal_notice',
];

export function isLegalDocumentType(value: unknown): value is LegalDocumentType {
  return typeof value === 'string' && LEGAL_TYPES.includes(value as LegalDocumentType);
}

function mapLegalDocument(value: unknown): LegalDocument | null {
  const row = asRecord(value);
  const id = asText(row?.id);
  const type = row?.document_type;
  const version = asText(row?.version);
  const title = asText(row?.title);
  const content = asText(row?.content);
  if (!id || !isLegalDocumentType(type) || !version || !title || !content) return null;
  return {
    id,
    type,
    version,
    title,
    content,
    publishedAt: asInstant(row?.published_at) ?? undefined,
  };
}

export async function fetchLegalDocument(
  type: LegalDocumentType,
  signal: AbortSignal,
): Promise<LegalDocument | null> {
  const data = await apiFetch<unknown>('/legal.php', { signal });
  return asDocuments(data)
    .map(mapLegalDocument)
    .find((document) => document?.type === type) ?? null;
}
