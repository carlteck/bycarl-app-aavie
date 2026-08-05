const FR_DATE_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/** Convertit "JJ/MM/AAAA" en ISO ("AAAA-MM-JJ") ; `null` si le format ou la date est invalide. */
export function parseFrenchDate(input: string): string | null {
  const match = FR_DATE_RE.exec(input.trim());
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const isValidCalendarDate =
    date.getFullYear() === Number(year) && date.getMonth() === Number(month) - 1 && date.getDate() === Number(day);
  return isValidCalendarDate ? `${year}-${month}-${day}` : null;
}

/** Extrait les chiffres (JJMMAAAA) d'une date ISO, pour piloter un champ saisi au clavier numérique. */
export function isoToDigits(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}${month}${year}`;
}

/** Insère les "/" au fil de la saisie (JJMMAAAA -> JJ/MM/AAAA), sans jamais exiger la touche "/". */
export function formatDateDigits(digits: string): string {
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

/** Valide 8 chiffres JJMMAAAA et renvoie la date ISO correspondante, ou `null` si invalide/incomplète. */
export function parseDateDigits(digits: string): string | null {
  if (digits.length !== 8) return null;
  return parseFrenchDate(formatDateDigits(digits));
}

const MONTHS_FR = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
];

export function formatISODateLong(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return `${day} ${MONTHS_FR[month - 1]} ${year}`;
}

export function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/** Nombre de jours entre aujourd'hui et la date ISO donnée (négatif si passée). */
export function daysUntil(iso: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const [ty, tm, td] = todayISO().split('-').map(Number);
  const [ey, em, ed] = iso.split('-').map(Number);
  const start = Date.UTC(ty, tm - 1, td);
  const end = Date.UTC(ey, em - 1, ed);
  return Math.round((end - start) / msPerDay);
}
