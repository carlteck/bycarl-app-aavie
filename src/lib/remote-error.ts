export type RemoteErrorKind =
  'network' | 'auth' | 'unavailable' | 'forbidden' | 'unknown';

type ErrorLike = { code?: unknown; message?: unknown; status?: unknown };

/**
 * Distingue les pannes que l'usager peut comprendre (réseau, session) de celles qui relèvent du
 * service (table pas encore publiée, droits). Les codes sont ceux de PostgREST / PostgreSQL :
 * `PGRST205` et `42P01` = relation absente, `42501` = privilège refusé, `PGRST301` = JWT refusé.
 */
export function classifyRemoteError(error: unknown): RemoteErrorKind {
  const value: ErrorLike =
    typeof error === 'object' && error !== null ? (error as ErrorLike) : {};
  const code = typeof value.code === 'string' ? value.code : '';
  const status = typeof value.status === 'number' ? value.status : 0;
  const message = typeof value.message === 'string' ? value.message : '';

  if (code === 'PGRST205' || code === '42P01') return 'unavailable';
  if (code === '42501') return 'forbidden';
  if (code === 'PGRST301' || code === 'PGRST303' || status === 401)
    return 'auth';
  if (status === 404) return 'unavailable';
  if (value instanceof Error && value.name === 'AbortError') return 'network';
  if (
    /network request failed|failed to fetch|network error|timed? ?out|load failed/i.test(
      message,
    )
  )
    return 'network';
  return 'unknown';
}

export function remoteErrorMessage(kind: RemoteErrorKind): string {
  switch (kind) {
    case 'network':
      return 'Connexion impossible. Vérifiez votre réseau, puis réessayez.';
    case 'auth':
      return 'Votre session a expiré. Reconnectez-vous pour continuer.';
    case 'unavailable':
      return 'Ce service n’est pas encore disponible. Réessayez plus tard.';
    case 'forbidden':
      return 'Vous n’avez pas accès à ces informations.';
    default:
      return 'Un problème est survenu. Réessayez dans un instant.';
  }
}

/** Au-delà, une requête est abandonnée : mieux vaut une erreur claire qu'un chargement sans fin. */
export const REQUEST_TIMEOUT_MS = 15_000;
