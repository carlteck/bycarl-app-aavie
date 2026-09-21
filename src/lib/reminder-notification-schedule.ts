/** Calcule l'heure de la notification locale, sans dépendre du module natif. */

const REMINDER_HOUR = 9;

export function reminderNotificationId(id: string): string {
  return `aavie-reminder:${id}`;
}

function morningOnISO(dateISO: string): Date {
  const [year, month, day] = dateISO.split('-').map(Number);
  return new Date(year, month - 1, day, REMINDER_HOUR, 0, 0, 0);
}

/**
 * Heure à laquelle prévenir : le matin du jour (échéance − délai), ou le matin
 * de l'échéance si ce créneau est déjà passé. `null` si l'échéance est révolue.
 */
export function reminderNotificationDate(
  dateISO: string,
  leadDays: number,
  now = new Date(),
): Date | null {
  const dueMorning = morningOnISO(dateISO);
  const leadMorning = new Date(dueMorning);
  leadMorning.setDate(leadMorning.getDate() - leadDays);
  if (leadMorning.getTime() > now.getTime()) return leadMorning;
  if (dueMorning.getTime() > now.getTime()) return dueMorning;
  return null;
}
