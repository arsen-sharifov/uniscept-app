import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { getAdminClient } from '@api/server/utils';
import { createClient, SUPABASE_CLIENT } from '@mocks/supabaseJs';

vi.mock('@supabase/supabase-js', () => import('@mocks/supabaseJs'));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getAdminClient', () => {
  describe('GIVEN the service role settings of the Supabase project', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co');
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key');
      vi.mocked(createClient).mockReturnValue(SUPABASE_CLIENT);
    });

    describe('WHEN the admin client is requested twice', () => {
      let clients: unknown[];

      beforeEach(() => {
        clients = [getAdminClient(), getAdminClient()];
      });

      test('THEN one service role client that keeps no session serves both requests', () => {
        expect(createClient).toHaveBeenCalledExactlyOnceWith('https://project.supabase.co', 'service-role-key', {
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        });
        expect(clients[0]).toBe(SUPABASE_CLIENT);
        expect(clients[1]).toBe(SUPABASE_CLIENT);
      });
    });
  });
});
