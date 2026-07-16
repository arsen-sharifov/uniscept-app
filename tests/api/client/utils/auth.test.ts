import { describe, expect, test, vi } from 'vitest';

import { getCurrentUserId } from '@api/client/utils';
import { createClient, primeSupabase } from '@mocks/supabase';

vi.mock('@/lib/supabase', () => import('@mocks/supabase'));

describe('getCurrentUserId', () => {
  describe('GIVEN a signed-in user', () => {
    describe('WHEN the current user id is resolved', () => {
      test('THEN the id is returned', async () => {
        primeSupabase([]);

        await expect(getCurrentUserId()).resolves.toBe('user-1');
      });
    });
  });

  describe('GIVEN no signed-in user', () => {
    describe('WHEN the current user id is resolved', () => {
      test('THEN the auth requirement error is thrown', async () => {
        primeSupabase([], { user: null });

        await expect(getCurrentUserId()).rejects.toThrow('Authenticated user required');
      });
    });
  });

  describe('GIVEN a failing auth check', () => {
    describe('WHEN the current user id is resolved', () => {
      test('THEN the auth error propagates', async () => {
        vi.mocked(createClient).mockReturnValue({
          auth: { getUser: vi.fn(async () => ({ data: { user: null }, error: new Error('auth down') })) },
        } as never);

        await expect(getCurrentUserId()).rejects.toThrow('auth down');
      });
    });
  });
});
