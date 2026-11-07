import { getIntlLocale } from '@/i18n/runtime';

/**
 * Validation stricte des lignes distantes : rien de ce qui arrive de Supabase n'est supposé avoir
 * le bon type. Une ligne inexploitable est écartée par l'appelant, jamais affichée à moitié.
 */
export function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function asOptionalText(value: unknown): string | undefined {
  const text = asText(value);
  return text.length > 0 ? text : undefined;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function asId(value: unknown): string | null {
  const text = asText(value);
  return UUID.test(text) ? text.toLowerCase() : null;
}

/** Identifiant d'entité PHP : UUID ou entier SQL positif, toujours normalisé en chaîne. */
export function asEntityId(value: unknown): string | null {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0)
    return String(value);
  const text = asText(value);
  return UUID.test(text) || /^\d+$/.test(text) ? text.toLowerCase() : null;
}

/** Date `YYYY-MM-DD` (colonne `date`) ou horodatage ISO ; retourne la date calendaire. */
export function asDay(value: unknown): string | null {
  const text = asText(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  if (!match) return null;
  const [, y, m, d] = match;
  const parsed = new Date(`${y}-${m}-${d}T12:00:00Z`);
  if (
    !Number.isFinite(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== `${y}-${m}-${d}`
  )
    return null;
  return `${y}-${m}-${d}`;
}

export function asInstant(value: unknown): string | null {
  const text = asText(value);
  return text && Number.isFinite(Date.parse(text)) ? text : null;
}

export function asOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | null {
  const text = asText(value);
  return allowed.find((item) => item === text) ?? null;
}

export function asCount(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.trunc(value)
    : null;
}

/** Date calendaire localisée ; midi UTC évite tout changement de jour selon le fuseau. */
export function formatDay(day: string): string {
  const [y, m, d] = day.split('-');
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), 12));
  return new Intl.DateTimeFormat(getIntlLocale(), {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC',
  }).format(date);
}

/** Instant ISO affiché à l'heure de l'appareil (celle de l'usager, pas celle du serveur). */
export function formatInstant(instant: string): string {
  const date = new Date(instant);
  if (!Number.isFinite(date.getTime())) return '';
  return new Intl.DateTimeFormat(getIntlLocale(), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
