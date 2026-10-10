import { AppState, type AppStateStatus } from 'react-native';

import { ApiError, apiFetch, NetworkError } from './api';
import { supabase } from './supabase';
import {
  clearSiteAuthSession,
  readSiteAuthSession,
  writeSiteAuthSession,
  type SiteAuthSession,
} from './site-auth-storage';

/**
 * Authentification mobile unifiée : le site (`MobileAuth.php`, `mobile-auth.php`) vérifie le mot
 * de passe et signe un jeton que Supabase accepte comme s'il venait de son propre système
 * d'identité (GoTrue). Il n'existe alors qu'un seul mot de passe, qui ne vit qu'au site.
 *
 * ⚠️ **Non branché à un écran pour l'instant, volontairement.** Tant que le secret JWT n'est pas
 * configuré côté site, `mobile-auth.php` répond 503 et `signInWithSite()` échoue proprement avec
 * un message clair — rien ne casse, mais rien ne remplace encore `auth-context.tsx` /
 * `supabase.auth.signInWithPassword`. Faire appeler cette fonction par `connexion.tsx` est le
 * geste d'activation, à faire une fois le secret renseigné et vérifié.
 *
 * Le jeton de renouvellement que renvoie le site n'est PAS un jeton Supabase : `autoRefreshToken`
 * de `supabase-js` tentera de l'utiliser via l'API GoTrue et échouera silencieusement à
 * l'approche de l'expiration (une heure). C'est pourquoi cette fonction tient son propre
 * calendrier de renouvellement, indépendant de celui de `supabase-js`.
 */

type RawTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

function isRawTokenResponse(value: unknown): value is RawTokenResponse {
  const v = value as Partial<RawTokenResponse> | null;
  return (
    typeof v?.access_token === 'string' &&
    typeof v?.refresh_token === 'string' &&
    typeof v?.expires_in === 'number'
  );
}

function toSession(response: RawTokenResponse): SiteAuthSession {
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresAt: new Date(Date.now() + response.expires_in * 1000).toISOString(),
  };
}

/** À l'application côté client : cinq minutes avant expiration, jamais moins de 30 secondes. */
export function refreshDelayMs(
  expiresAtIso: string,
  now: number = Date.now(),
): number {
  const marginMs = 5 * 60 * 1000;
  const minDelayMs = 30 * 1000;
  return Math.max(
    new Date(expiresAtIso).getTime() - now - marginMs,
    minDelayMs,
  );
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let appStateSubscription: { remove: () => void } | null = null;

function cancelScheduledRefresh(): void {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = null;
}

function scheduleRefresh(session: SiteAuthSession): void {
  cancelScheduledRefresh();
  refreshTimer = setTimeout(() => {
    void refreshSiteSession();
  }, refreshDelayMs(session.expiresAt));
  // `unref()` n'existe que sous Node (nos tests) ; sous Hermes/JSC, `setTimeout` renvoie un
  // nombre et l'appel optionnel ne fait rien. Sans lui, un test qui pose une session laisserait
  // une minuterie d'une heure vivante et empêcherait le processus de se terminer.
  (refreshTimer as unknown as { unref?: () => void })?.unref?.();
}

async function applySession(session: SiteAuthSession): Promise<void> {
  await writeSiteAuthSession(session);
  // `autoRefreshToken` de supabase-js échouera à renouveler ce jeton-ci de son côté (voir
  // plus haut) : sans effet de bord, puisqu'on ne dépend jamais de ce renouvellement-là ici.
  const { error } = await supabase.auth.setSession({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  });
  if (error) throw error;
  scheduleRefresh(session);
}

/**
 * Connexion par mot de passe, vérifiée par le site. Lève `ApiError` (message déjà adapté à
 * l'utilisateur, voir `mobile-auth.php`) ou `NetworkError`.
 */
export async function signInWithSite(
  email: string,
  password: string,
): Promise<void> {
  const data = await apiFetch<unknown>('/mobile-auth.php', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!isRawTokenResponse(data))
    throw new ApiError('Réponse inattendue du serveur.', 502);
  await applySession(toSession(data));
}

/**
 * Renouvelle la session à partir du jeton de renouvellement stocké. Appelée par le calendrier
 * interne, et peut aussi être appelée après un retour au premier plan si l'application est
 * restée en arrière-plan plus longtemps que prévu. `false` si la session doit être reconnue
 * comme terminée (jeton de renouvellement absent, expiré ou déjà utilisé) — l'appelant doit
 * alors renvoyer l'utilisateur à l'écran de connexion, pas réessayer.
 */
export async function refreshSiteSession(): Promise<boolean> {
  const current = await readSiteAuthSession();
  if (!current) return false;
  try {
    const data = await apiFetch<unknown>('/mobile-auth-refresh.php', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: current.refreshToken }),
    });
    if (!isRawTokenResponse(data))
      throw new ApiError('Réponse inattendue.', 502);
    await applySession(toSession(data));
    return true;
  } catch (error) {
    if (error instanceof NetworkError) {
      // Pas de réseau : la session reste valable jusqu'à l'expiration du jeton d'accès déjà en
      // main, on réessaiera au prochain retour au premier plan plutôt que d'abandonner ici.
      scheduleRefresh(current);
      return true;
    }
    // 401 (jeton de renouvellement expiré ou déjà consommé) ou 503 (désactivé côté site) :
    // la session ne peut plus continuer d'elle-même.
    await signOutSite();
    return false;
  }
}

export async function signOutSite(): Promise<void> {
  cancelScheduledRefresh();
  await clearSiteAuthSession();
  await supabase.auth.signOut({ scope: 'local' });
}

/**
 * À appeler une fois au démarrage de l'application : reprend une session déjà ouverte (jeton
 * encore valable, ou renouvelable) sans redemander le mot de passe. `false` si aucune session
 * unifiée n'existe ou n'a pu être reprise — l'ancien mécanisme (`auth-context.tsx`) reste alors
 * seul maître, exactement comme aujourd'hui.
 */
export async function restoreSiteSession(): Promise<boolean> {
  const current = await readSiteAuthSession();
  if (!current) return false;
  if (new Date(current.expiresAt).getTime() > Date.now() + 30_000) {
    try {
      await applySession(current);
      return true;
    } catch {
      // Le jeton stocké est lisible mais Supabase le refuse (secret changé entre-temps, par
      // exemple) : on retombe sur un renouvellement complet plutôt que de laisser une session
      // à moitié posée.
    }
  }
  return refreshSiteSession();
}

/**
 * Met le calendrier de renouvellement en veille pendant que l'application est en arrière-plan,
 * et vérifie l'état de la session au retour — même principe que `SyncProvider` pour la
 * synchronisation Supabase : aucun appel réseau tant que l'application n'est pas au premier
 * plan. Idempotent ; l'abonnement précédent est retiré avant d'en poser un nouveau.
 */
export function watchSiteSessionLifecycle(): () => void {
  appStateSubscription?.remove();
  const onChange = (state: AppStateStatus) => {
    if (state === 'active') {
      void readSiteAuthSession().then((current) => {
        if (current) void refreshSiteSession();
      });
    } else {
      cancelScheduledRefresh();
    }
  };
  appStateSubscription = AppState.addEventListener('change', onChange);
  return () => {
    appStateSubscription?.remove();
    appStateSubscription = null;
    cancelScheduledRefresh();
  };
}
