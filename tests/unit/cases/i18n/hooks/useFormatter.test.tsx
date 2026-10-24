import { renderHook } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { AUTHORSHIP_TIMES } from '@mocks/canvas';
import { AUCKLAND_RESOLVED_OPTIONS, UTC_EVENING, UTC_RESOLVED_OPTIONS } from '@mocks/i18n';
import { useFormatter } from '@/i18n';
import uk from '@/locales/uk.json';

const UkrainianProvider = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="uk" messages={uk} timeZone="UTC">
    {children}
  </NextIntlClientProvider>
);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useFormatter', () => {
  describe('GIVEN a ukrainian request from a viewer whose clock runs in UTC', () => {
    beforeEach(() => {
      vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue(UTC_RESOLVED_OPTIONS);
    });

    describe('WHEN a date is formatted', () => {
      let formatted: string;

      beforeEach(() => {
        const format = renderHook(() => useFormatter(), { wrapper: UkrainianProvider }).result.current;
        formatted = format.dateTime(new Date(AUTHORSHIP_TIMES.lastYear), { day: 'numeric', month: 'long' });
      });

      test('THEN it follows the language of the request', () => {
        expect(formatted).toBe('1 березня');
      });
    });
  });

  describe('GIVEN a viewer whose clock runs in Auckland', () => {
    beforeEach(() => {
      vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue(AUCKLAND_RESOLVED_OPTIONS);
    });

    describe('WHEN an evening in UTC is formatted', () => {
      let formatted: string;

      beforeEach(() => {
        const format = renderHook(() => useFormatter(), { wrapper: UkrainianProvider }).result.current;
        formatted = format.dateTime(new Date(UTC_EVENING), { day: 'numeric', month: 'long' });
      });

      test('THEN the date is the one on the viewer clock, already the next day', () => {
        expect(formatted).toBe('2 березня');
      });
    });
  });
});
