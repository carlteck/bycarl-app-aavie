/**
 * Langues proposées à l'inscription.
 *
 * ⚠️ Liste dupliquée depuis `src/i18n/index.ts` du dépôt site_aavie, et validée côté serveur par
 * `Locales::SUPPORTED` : les trois doivent rester alignées, sinon un choix accepté ici serait
 * silencieusement ramené au français par l'API.
 *
 * L'interface de l'application n'est pas encore traduite : ce choix est enregistré sur le compte
 * et suit l'utilisateur sur le site, mais les écrans mobiles restent en français pour l'instant.
 * Le kréyòl gwiyannen vient juste après le français — c'est la langue du public prioritaire
 * d'AAVIE, pas une langue étrangère de plus.
 */
export type AavieLocale = {
  code: string;
  label: string;
  flag: string;
  /** Vrai seulement pour la langue de référence ; les autres ne couvrent que la coquille. */
  complete: boolean;
};

export const LOCALES: AavieLocale[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷', complete: true },
  { code: 'gcr', label: 'Kréyòl', flag: '🇬🇫', complete: false },
  { code: 'en', label: 'English', flag: '🇬🇧', complete: false },
  { code: 'es', label: 'Español', flag: '🇪🇸', complete: false },
  { code: 'pt', label: 'Português', flag: '🇵🇹', complete: false },
];

export const DEFAULT_LOCALE = LOCALES[0];
