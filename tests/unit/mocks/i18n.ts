import { createTranslator } from 'next-intl';
import { vi } from 'vitest';

import en from '@/locales/en.json';

export const LOCALES = ['en', 'uk', 'ro', 'fr', 'es', 'pt'] as const;

export const DEFAULT_LOCALE = 'en';

export const TRANSLATIONS = en;

const translator = Object.assign(createTranslator({ locale: DEFAULT_LOCALE, messages: TRANSLATIONS }), TRANSLATIONS);

export const useTranslations = () => translator;

export const useLocale = () => DEFAULT_LOCALE;

export const setLocale = vi.fn();

export const clearLocale = vi.fn();
