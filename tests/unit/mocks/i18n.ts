import { createTranslator } from 'next-intl';
import { vi } from 'vitest';

import en from '@/locales/en.json';

export const LOCALES = ['en', 'uk', 'ro', 'fr', 'es', 'pt'] as const;

export const DEFAULT_LOCALE = 'en';

export const TRANSLATIONS = en;

export const createTranslations = () =>
  Object.assign(createTranslator({ locale: DEFAULT_LOCALE, messages: TRANSLATIONS }), TRANSLATIONS);

export const translate = createTranslations();

export const useTranslations = () => translate;

export const useLocale = () => DEFAULT_LOCALE;

export const setLocale = vi.fn();

export const clearLocale = vi.fn();

export const collectMessages = (dictionary: object, prefix = ''): Array<[string, string]> =>
  Object.entries(dictionary).flatMap(([key, value]): Array<[string, string]> => {
    if (typeof value === 'object' && value !== null) return collectMessages(value, `${prefix}${key}.`);
    if (typeof value !== 'string') return [];

    return [[`${prefix}${key}`, value]];
  });

export const EN_MESSAGES = new Map(collectMessages(en));
