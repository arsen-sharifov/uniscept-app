import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { verifyPassword } from '@api/server/utils';
import { createClient } from '@mocks/supabaseJs';

vi.mock('@supabase/supabase-js', () => import('@mocks/supabaseJs'));

const signInWithPassword = vi.fn();

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('verifyPassword', () => {
  describe('GIVEN the public Supabase project settings', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co');
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');
      signInWithPassword.mockResolvedValue({ data: { user: null, session: null }, error: null });
      vi.mocked(createClient).mockReturnValue({ auth: { signInWithPassword } } as never);
    });

    describe('WHEN a password is verified', () => {
      test('THEN a fresh anon client that keeps no session signs in with those credentials', async () => {
        await expect(verifyPassword('user@uniscept.dev', 'secret')).resolves.toEqual({
          data: { user: null, session: null },
          error: null,
        });
        expect(createClient).toHaveBeenCalledExactlyOnceWith('https://project.supabase.co', 'anon-key', {
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        });
        expect(signInWithPassword).toHaveBeenCalledExactlyOnceWith({ email: 'user@uniscept.dev', password: 'secret' });
      });
    });
  });
});
