/**
 * Langues proposées à l'inscription.
 *
 * ⚠️ Liste dupliquée depuis `src/i18n/index.ts` du dépôt site_aavie, et validée côté serveur par
 * `Locales::SUPPORTED` : les trois doivent rester alignées, sinon un choix accepté ici serait
 * silencieusement ramené au français par l'API.
 *
 * Le français définit toutes les clés. Chaque autre dictionnaire doit conserver la même parité.
 * `ht` désigne le kreyòl ayisyen, comme sur le site ; l'ancien code `gcr` est normalisé vers `ht`.
 */
export type AavieLocale = {
  code: string;
  label: string;
  flag: string;
  complete: boolean;
};

export const LOCALES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷', complete: true },
  { code: 'en', label: 'English', flag: '🇬🇧', complete: true },
  { code: 'es', label: 'Español', flag: '🇪🇸', complete: true },
  { code: 'pt', label: 'Português', flag: '🇵🇹', complete: true },
  { code: 'ht', label: 'Kreyòl ayisyen', flag: '🇭🇹', complete: true },
] as const satisfies readonly AavieLocale[];

export const DEFAULT_LOCALE = LOCALES[0];

export type LocaleCode = (typeof LOCALES)[number]['code'];

export function normalizeLocale(code: string | null | undefined): LocaleCode {
  const normalized = code === 'gcr' ? 'ht' : code;
  return LOCALES.some((locale) => locale.code === normalized)
    ? (normalized as LocaleCode)
    : DEFAULT_LOCALE.code;
}
