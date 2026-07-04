'use client';

import { createTranslator, useLocale, useMessages } from 'next-intl';
import { useMemo } from 'react';

import type { TTranslations } from '@interfaces';

export const useTranslations = () => {
  const locale = useLocale();
  const messages = useMessages() as TTranslations;

  return useMemo(() => Object.assign(createTranslator({ locale, messages }), messages), [locale, messages]);
};
