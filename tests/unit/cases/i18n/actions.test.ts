import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { TLocale } from '@interfaces';

import { cookieStore } from '@mocks/nextHeaders';
import { LOCALE_COOKIE, clearLocale, setLocale } from '@/i18n';

vi.mock('next/headers', () => import('@mocks/nextHeaders'));

describe('setLocale', () => {
  describe('GIVEN a supported language', () => {
    describe('WHEN it is picked', () => {
      beforeEach(async () => {
        await setLocale('uk');
      });

      test('THEN the locale cookie remembers it', () => {
        expect(cookieStore.set).toHaveBeenCalledExactlyOnceWith(
          LOCALE_COOKIE,
          'uk',
          expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' }),
        );
      });
    });
  });

  describe('GIVEN a forged value outside the supported languages', () => {
    describe('WHEN the action is called with it', () => {
      beforeEach(async () => {
        await setLocale('../en' as TLocale);
      });

      test('THEN no cookie is written', () => {
        expect(cookieStore.set).not.toHaveBeenCalled();
      });
    });
  });
});

describe('clearLocale', () => {
  describe('GIVEN a remembered language', () => {
    describe('WHEN it is cleared', () => {
      beforeEach(async () => {
        await clearLocale();
      });

      test('THEN the locale cookie is deleted', () => {
        expect(cookieStore.delete).toHaveBeenCalledExactlyOnceWith(LOCALE_COOKIE);
      });
    });
  });
});
