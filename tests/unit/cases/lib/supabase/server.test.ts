import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { cookieStore, REQUEST_COOKIES } from '@mocks/nextHeaders';
import { SUPABASE_CLIENT } from '@mocks/supabaseJs';
import { createServerClient } from '@mocks/supabaseSsr';
import { createClient } from '@/lib/supabase/server';

vi.mock('@supabase/ssr', () => import('@mocks/supabaseSsr'));
vi.mock('next/headers', () => import('@mocks/nextHeaders'));

const cookieAdapter = () => vi.mocked(createServerClient).mock.calls[0]?.[2].cookies;

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('createClient', () => {
  describe('GIVEN the public Supabase project settings and the request cookies', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co');
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');
      cookieStore.getAll.mockReturnValue(REQUEST_COOKIES);
      vi.mocked(createServerClient).mockReturnValue(SUPABASE_CLIENT);
    });

    describe('WHEN the server client is created', () => {
      let client: unknown;

      beforeEach(async () => {
        client = await createClient();
      });

      test('THEN a server client for the project and its anon key is returned', () => {
        expect(createServerClient).toHaveBeenCalledExactlyOnceWith(
          'https://project.supabase.co',
          'anon-key',
          expect.objectContaining({ cookies: expect.any(Object) }),
        );
        expect(client).toBe(SUPABASE_CLIENT);
      });
    });

    describe('WHEN supabase reads the session', () => {
      let sessionCookies: unknown;

      beforeEach(async () => {
        await createClient();
        sessionCookies = cookieAdapter().getAll();
      });

      test('THEN it gets the request cookies', () => {
        expect(sessionCookies).toEqual(REQUEST_COOKIES);
      });
    });

    describe('WHEN supabase refreshes the session', () => {
      beforeEach(async () => {
        await createClient();
        cookieAdapter().setAll([
          { name: 'sb-session', value: 'fresh', options: { path: '/' } },
          { name: 'sb-refresh', value: 'token', options: { httpOnly: true } },
        ]);
      });

      test('THEN every refreshed cookie is written back with its options', () => {
        expect(cookieStore.set.mock.calls).toEqual([
          ['sb-session', 'fresh', { path: '/' }],
          ['sb-refresh', 'token', { httpOnly: true }],
        ]);
      });
    });
  });
});
