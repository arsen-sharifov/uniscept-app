import { beforeEach, describe, expect, test, vi } from 'vitest';

import { primeSupabase } from '@mocks/supabase';
import { createClient as createServerClient } from '@mocks/supabaseServer';
import requestConfig from '@/i18n/request';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import uk from '@/locales/uk.json';

const resolveConfig = requestConfig as unknown as () => Promise<{ locale: string; messages: unknown }>;

const { cookies, headers } = vi.hoisted(() => ({ cookies: vi.fn(), headers: vi.fn() }));

vi.mock('next-intl/server', () => ({
  getRequestConfig: (factory: () => Promise<unknown>) => factory,
}));

vi.mock('next/headers', () => ({ cookies, headers }));

vi.mock('@/lib/supabase/server', () => import('@mocks/supabaseServer'));

const primeRequest = (options: { pathname?: string; cookieLocale?: string }) => {
  headers.mockResolvedValue(new Map(options.pathname ? [['x-pathname', options.pathname]] : []));
  cookies.mockResolvedValue({
    get: () => (options.cookieLocale ? { value: options.cookieLocale } : undefined),
  });
};

describe('requestConfig', () => {
  describe('GIVEN a locale-locked pathname and a ukrainian cookie', () => {
    beforeEach(() => {
      primeRequest({ pathname: '/login', cookieLocale: 'uk' });
    });

    describe('WHEN the request locale is resolved', () => {
      test('THEN the locked path pins the default locale', async () => {
        await expect(resolveConfig()).resolves.toMatchObject({ locale: 'en', messages: en });
      });
    });
  });

  describe('GIVEN an auth callback pathname', () => {
    beforeEach(() => {
      primeRequest({ pathname: '/auth/confirmed', cookieLocale: 'uk' });
    });

    describe('WHEN the request locale is resolved', () => {
      test('THEN the default locale wins over the cookie', async () => {
        await expect(resolveConfig()).resolves.toMatchObject({ locale: 'en' });
      });
    });
  });

  describe('GIVEN a supported cookie locale on a regular pathname', () => {
    beforeEach(() => {
      primeRequest({ pathname: '/platform', cookieLocale: 'uk' });
    });

    describe('WHEN the request locale is resolved', () => {
      test('THEN the cookie locale is served with its dictionary', async () => {
        await expect(resolveConfig()).resolves.toMatchObject({ locale: 'uk', messages: uk });
      });
    });
  });

  describe('GIVEN an unsupported cookie locale and a stored user preference', () => {
    beforeEach(() => {
      primeRequest({ pathname: '/platform', cookieLocale: 'xx' });
      const { client } = primeSupabase([{ data: { language: 'fr' } }], { user: { id: 'user-1' } });
      vi.mocked(createServerClient).mockResolvedValue(client as never);
    });

    describe('WHEN the request locale is resolved', () => {
      test('THEN the database preference is served', async () => {
        await expect(resolveConfig()).resolves.toMatchObject({ locale: 'fr', messages: fr });
      });
    });
  });

  describe('GIVEN no cookie and no authenticated user', () => {
    beforeEach(() => {
      primeRequest({ pathname: '/platform' });
      const { client } = primeSupabase([], { user: null });
      vi.mocked(createServerClient).mockResolvedValue(client as never);
    });

    describe('WHEN the request locale is resolved', () => {
      test('THEN the default locale is served', async () => {
        await expect(resolveConfig()).resolves.toMatchObject({ locale: 'en' });
      });
    });
  });

  describe('GIVEN an authenticated user without a preferences row', () => {
    beforeEach(() => {
      primeRequest({ pathname: '/platform' });
      const { client } = primeSupabase([{ data: null }], { user: { id: 'user-1' } });
      vi.mocked(createServerClient).mockResolvedValue(client as never);
    });

    describe('WHEN the request locale is resolved', () => {
      test('THEN the default locale is served', async () => {
        await expect(resolveConfig()).resolves.toMatchObject({ locale: 'en' });
      });
    });
  });

  describe('GIVEN a failing supabase client', () => {
    beforeEach(() => {
      primeRequest({ pathname: '/platform' });
      vi.mocked(createServerClient).mockRejectedValue(new Error('connection refused'));
    });

    describe('WHEN the request locale is resolved', () => {
      test('THEN the failure falls back to the default locale', async () => {
        await expect(resolveConfig()).resolves.toMatchObject({ locale: 'en', messages: en });
      });
    });
  });
});
