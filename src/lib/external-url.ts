/**
 * Les liens affichés dans l'application viennent de Supabase, donc d'une source que le mobile ne
 * maîtrise pas : `Linking.openURL('javascript:…')`, `intent:` ou `file:` ne doivent jamais partir
 * d'une donnée distante. Seul `https:` est accepté (un lien `http:` reste lisible en clair sur le
 * réseau, ce qui n'a pas sa place dans une application qui manipule des démarches personnelles).
 */
export function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 2048) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:' || !url.hostname.includes('.')) return null;
    if (url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

/** Numéro composable : chiffres, `+`, espaces usuels. Retourne le numéro sans séparateurs. */
export function safePhoneNumber(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const digits = value.replace(/[\s.\-()]/g, '');
  return /^\+?\d{3,15}$/.test(digits) ? digits : null;
}
