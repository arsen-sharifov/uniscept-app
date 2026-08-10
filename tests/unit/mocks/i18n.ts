import en from '@/locales/en.json';

export const LOCALES = ['en', 'uk', 'ro', 'fr', 'es', 'pt'] as const;

export const DEFAULT_LOCALE = 'en';

export const TRANSLATIONS = en;

export const useTranslations = () => TRANSLATIONS;
