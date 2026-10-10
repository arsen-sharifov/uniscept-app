import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { SUPABASE_CLIENT } from '@mocks/supabaseJs';
import { createBrowserClient } from '@mocks/supabaseSsr';
import { createClient } from '@/lib/supabase/client';

vi.mock('@supabase/ssr', () => import('@mocks/supabaseSsr'));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('createClient', () => {
  describe('GIVEN the public Supabase project settings', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co');
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');
      vi.mocked(createBrowserClient).mockReturnValue(SUPABASE_CLIENT);
    });

    describe('WHEN the browser client is created', () => {
      let client: unknown;

      beforeEach(() => {
        client = createClient();
      });

      test('THEN a browser client for the project and its anon key is returned', () => {
        expect(createBrowserClient).toHaveBeenCalledExactlyOnceWith('https://project.supabase.co', 'anon-key');
        expect(client).toBe(SUPABASE_CLIENT);
      });
    });
  });
});
