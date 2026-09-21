/**
 * Motif `ilike` PostgREST pour une saisie libre.
 *
 * Les filtres `or(...)` de PostgREST se composent en texte : une virgule, une parenthèse ou un
 * guillemet saisis par l'usager modifieraient la structure du filtre. Les jokers `%` et `_`
 * élargiraient la recherche à tout le catalogue. On retire donc ces caractères plutôt que de
 * tenter de les échapper (l'échappement diffère selon l'opérateur) : une recherche sur du texte
 * courant n'en a pas besoin. `null` = pas de filtre.
 */
export function toIlikePattern(input: string): string | null {
  const cleaned = input
    .replace(/[%_*\\,()"'`:;.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
  return cleaned.length >= 2 ? `%${cleaned}%` : null;
}
