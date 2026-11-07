import { getLocales } from 'expo-localization';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { normalizeLocale, type LocaleCode } from '@/constants/locales';
import { useAuth } from '@/context/auth-context';
import { dictionaries, fr, type TranslationKey } from '@/i18n/messages';
import { setCurrentLocale } from '@/i18n/runtime';
import { sitePhrases } from '@/i18n/site-phrases.generated';
import { mobilePhrases } from '@/i18n/mobile-phrases';
import { readStoredLocale, writeStoredLocale } from '@/lib/locale-storage';

type LocaleContextValue = {
  locale: LocaleCode;
  intlLocale: string;
  t: (key: TranslationKey) => string;
  translateText: (text: string) => string;
  setLocale: (locale: LocaleCode) => Promise<void>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [locale, setLocaleState] = useState<LocaleCode>(() =>
    normalizeLocale(getLocales()[0]?.languageCode),
  );

  useEffect(() => {
    let active = true;
    void readStoredLocale().then((stored) => {
      if (active) setLocaleState(normalizeLocale(stored ?? user?.locale));
    });
    return () => { active = false; };
  }, [user?.locale]);

  const setLocale = useCallback(async (next: LocaleCode) => {
    setLocaleState(next);
    await writeStoredLocale(next);
  }, []);

  useEffect(() => {
    setCurrentLocale(locale);
  }, [locale]);

  const dictionary = dictionaries[locale] ?? fr;
  const frenchEntries = useMemo(
    () => new Map<string, TranslationKey>(
      Object.entries(fr).map(([key, value]) => [value, key as TranslationKey]),
    ),
    [],
  );
  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    intlLocale: locale === 'ht' ? 'ht-HT' : locale,
    t: (key) => dictionary[key] ?? fr[key],
    translateText: (text) => {
      const key = frenchEntries.get(text);
      if (key) return dictionary[key] ?? fr[key];
      return mobilePhrases[locale][text] ?? sitePhrases[locale][text] ?? text;
    },
    setLocale,
  }), [dictionary, frenchEntries, locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within a LocaleProvider');
  return context;
}
