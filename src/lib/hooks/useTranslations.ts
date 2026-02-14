import en from '@/locales/en.json';

type Translations = typeof en;

export const useTranslations = (): Translations => {
  return en;
};
