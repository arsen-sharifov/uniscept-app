'use client';

import { useMessages } from 'next-intl';

import type { TTranslations } from '@interfaces';

export const useTranslations = (): TTranslations => useMessages() as TTranslations;
