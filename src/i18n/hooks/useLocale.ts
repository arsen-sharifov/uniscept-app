'use client';

import { useLocale as useIntlLocale } from 'next-intl';

import type { TLocale } from '@interfaces';

export const useLocale = () => useIntlLocale() as TLocale;
