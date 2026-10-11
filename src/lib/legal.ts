import { apiFetch } from './api';

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
