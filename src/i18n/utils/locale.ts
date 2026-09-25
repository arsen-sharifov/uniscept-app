import type { TLocale } from '@interfaces';

import { DEFAULT_LOCALE, LOCALES } from '../consts';

export const negotiateLocale = (header: string | null): TLocale =>
  header
    ?.split(',')
    .map((entry) => entry.split(/[-;]/)[0]?.trim().toLowerCase())
    .find((language): language is TLocale => LOCALES.includes(language as TLocale)) ?? DEFAULT_LOCALE;
