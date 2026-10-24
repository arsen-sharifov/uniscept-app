'use client';

import { createFormatter } from 'next-intl';
import { useMemo } from 'react';

import { useLocale } from './useLocale';

export const useFormatter = () => {
  const locale = useLocale();

  return useMemo(
    () => createFormatter({ locale, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
    [locale],
  );
};
