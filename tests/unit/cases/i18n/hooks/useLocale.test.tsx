import { renderHook } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test } from 'vitest';

import type { TLocale } from '@interfaces';

import { useLocale } from '@/i18n';
import pt from '@/locales/pt.json';

const PortugueseProvider = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="pt" messages={pt}>
    {children}
  </NextIntlClientProvider>
);

describe('useLocale', () => {
  describe('GIVEN a portuguese request', () => {
    describe('WHEN the locale is read', () => {
      let locale: TLocale;

      beforeEach(() => {
        locale = renderHook(() => useLocale(), { wrapper: PortugueseProvider }).result.current;
      });

      test('THEN it is portuguese', () => {
        expect(locale).toBe('pt');
      });
    });
  });
});
