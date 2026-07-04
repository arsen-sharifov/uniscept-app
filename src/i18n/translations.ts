import { getMessages } from 'next-intl/server';

import type { TTranslations } from '@interfaces';

export const getTranslations = async (): Promise<TTranslations> => (await getMessages()) as TTranslations;
