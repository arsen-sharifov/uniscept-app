import type { TLocale } from '@interfaces';

export const LOCALES: readonly TLocale[] = ['en', 'uk', 'ro', 'fr', 'es', 'pt'];

export const DEFAULT_LOCALE: TLocale = 'en';

export const LOCALE_COOKIE = 'uniscept-locale';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
