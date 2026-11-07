import { readSessionToken } from './session-storage';
import { readSiteAuthSession } from './site-auth-storage';
import { supabase } from './supabase';

/**
 * API PHP AAVIE. Le jeton de la session unifiée est prioritaire : il est accepté par les routes
 * de l'assistant après vérification serveur. Le jeton historique et le cookie sont conservés
 * pour les autres parcours existants.
 */
/**
 * Domaine de production. `EXPO_PUBLIC_API_URL` le remplace en développement, par exemple
 * `EXPO_PUBLIC_API_URL=https://aavie-api.test pnpm start` contre le site Herd local.
 *
 * ⚠️ Cette valeur est figée dans le binaire au moment du build : la changer impose un nouveau
 * build, pas une simple mise à jour du bundle. D'où le domaine définitif et jamais une URL
 * technique d'hébergeur, qui n'a pas vocation à survivre à un déménagement.
 */
export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://aavieapp.com/api';

export class ApiError extends Error {
  status: number;

  constructor(
    message: string,
    status: number,
    readonly code?: string,
  ) {
    super(message);
    this.status = status;
  }
}

/** Le réseau mobile tombe : un échec de transport doit être distinguable d'un refus serveur. */
export class NetworkError extends Error {
  constructor() {
    super(
      'Connexion impossible. Vérifiez votre connexion internet et réessayez.',
    );
  }
}

export async function apiAuthorizationHeaders(): Promise<
  Record<string, string>
> {
  const siteSession = await readSiteAuthSession();
  let token = siteSession?.accessToken ?? (await readSessionToken());
  if (!siteSession) {
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token ?? token;
  }
  if (!token)
    throw new ApiError('Connectez-vous à votre compte AAVIE.', 401);
  return { Authorization: `Bearer ${token}` };
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const siteRequest =
    /^\/(?:ai\/(?:chat|conversation|conversations|quota|tool-confirm)|credits|news|resources|contacts|procedures|support-tickets|support-ticket|documents|document|document-folders|document-folder|cloud)\.php(?:\?|$)/.test(path);
  const authorization = siteRequest ? await apiAuthorizationHeaders() : {};

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body instanceof FormData
          ? {}
          : { 'Content-Type': 'application/json' }),
        Accept: 'application/json',
        ...authorization,
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
      response.status,
      typeof (data as { code?: unknown } | null)?.code === 'string'
        ? (data as { code: string }).code
        : undefined,
    );
  }

  return data as T;
}
