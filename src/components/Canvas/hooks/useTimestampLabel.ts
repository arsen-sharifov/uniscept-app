'use client';

import type { ITimestampLabel } from '@interfaces';

import { useFormatter, useTranslations } from '@/i18n';

import {
  EXACT_TIMESTAMP_FORMAT,
  JUST_NOW_MS,
  RELATIVE_TIME_LIMIT_MS,
  SHORT_DATE_FORMAT,
  SHORT_DATE_WITH_YEAR_FORMAT,
} from '../consts';
import { useMinuteClock } from './useMinuteClock';

export const useTimestampLabel = (timestamp?: string): ITimestampLabel | null => {
  const t = useTranslations();
  const format = useFormatter();
  const now = useMinuteClock();

  const date = timestamp ? new Date(timestamp) : null;
  if (!date || Number.isNaN(date.getTime())) return null;

  const elapsed = now - date.getTime();

  const toLabel = () => {
    if (elapsed < JUST_NOW_MS) return t.platform.canvas.authorship.justNow;
    if (elapsed < RELATIVE_TIME_LIMIT_MS) return format.relativeTime(date, { now, style: 'short' });

    return format.dateTime(
      date,
      date.getFullYear() === new Date(now).getFullYear() ? SHORT_DATE_FORMAT : SHORT_DATE_WITH_YEAR_FORMAT,
    );
  };

  return {
    label: toLabel(),
    exact: format.dateTime(date, EXACT_TIMESTAMP_FORMAT),
    dateTime: date.toISOString(),
  };
};
