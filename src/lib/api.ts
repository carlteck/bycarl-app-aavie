import { readSessionToken } from './session-storage';

/**
 * Client HTTP de l'API AAVIE (PHP, dépôt site_aavie), pendant mobile de `src/lib/api.ts` côté
 * site. Les endpoints et leurs contrats sont identiques : c'est le même serveur.
 *
 * Deux mécanismes d'authentification cohabitent volontairement :
 *
 *  - `Authorization: Bearer <jeton>` dès qu'un jeton est stocké. C'est la cible : le cookie de
 *    session PHP a `lifetime => 0`, et sa survie au redémarrage de l'application n'est garantie
 *    par aucun contrat côté iOS ni Android. Un utilisateur reconnecté de force à chaque
 *    lancement serait inacceptable.
 *  - `credentials: 'include'` sinon, qui fait fonctionner la session par cookie sur natif tant
 *    que l'API n'émet pas encore de jeton (demande transmise à la session qui tient le site).
 *
 * Le jour où l'API retourne un jeton à la connexion, rien ne change ici : `login()` le stocke et
 * l'en-tête part tout seul.
 */
const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ??
  'https://quizzical-nightingale.167-114-114-69.plesk.page/api';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Le réseau mobile tombe : un échec de transport doit être distinguable d'un refus serveur. */
export class NetworkError extends Error {
  constructor() {
    super('Connexion impossible. Vérifiez votre connexion internet et réessayez.');
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await readSessionToken();

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new NetworkError();
  }

  // Une réponse non-JSON (page d'erreur du serveur, portail captif) ne doit pas faire planter
  // l'application avec une exception de parsing incompréhensible pour l'utilisateur.
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      (data as { error?: string } | null)?.error ?? 'Une erreur est survenue.',
      response.status
    );
  }

  return data as T;
}
