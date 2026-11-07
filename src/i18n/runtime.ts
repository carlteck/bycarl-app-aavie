import type { LocaleCode } from '@/constants/locales';

let currentLocale: LocaleCode = 'fr';

export function setCurrentLocale(locale: LocaleCode) {
  currentLocale = locale;
}

export function getIntlLocale(): string {
  return currentLocale === 'ht' ? 'ht-HT' : currentLocale;
}

export function getSpeechLocale(): string {
  return { fr: 'fr-FR', en: 'en-US', es: 'es-ES', pt: 'pt-PT', ht: 'ht-HT' }[currentLocale];
}
