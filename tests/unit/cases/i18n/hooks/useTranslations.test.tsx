import { renderHook } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test } from 'vitest';

import { useTranslations } from '@/i18n';
import uk from '@/locales/uk.json';

const UkrainianProvider = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="uk" messages={uk}>
    {children}
  </NextIntlClientProvider>
);

describe('useTranslations', () => {
  describe('GIVEN the ukrainian dictionary', () => {
    describe('WHEN the hook renders', () => {
      let translator: ReturnType<typeof useTranslations>;

      beforeEach(() => {
        translator = renderHook(() => useTranslations(), { wrapper: UkrainianProvider }).result.current;
      });

      test('THEN plain copy reads as properties and messages with values are formatted', () => {
        expect(translator.common.close).toBe(uk.common.close);
        expect(translator('platform.onboarding.stepCounter', { index: 2, total: 5 })).toBe('крок 2 з 5');
      });
    });

    describe('WHEN the component re-renders with the same dictionary', () => {
      let first: ReturnType<typeof useTranslations>;
      let second: ReturnType<typeof useTranslations>;

      beforeEach(() => {
        const { result, rerender } = renderHook(() => useTranslations(), { wrapper: UkrainianProvider });
        first = result.current;
        rerender();
        second = result.current;
      });

      test('THEN the same translator is kept', () => {
        expect(second).toBe(first);
      });
    });
  });
});
