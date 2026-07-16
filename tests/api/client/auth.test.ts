import { describe, expect, test, vi } from 'vitest';

import { completeInvitedAccount, getSession, setSession, signIn, signOut, signUp } from '@api/client';
import { primeSupabase } from '@mocks/supabase';

vi.mock('@/lib/supabase/client', () => import('@mocks/supabase'));

describe('signIn', () => {
  describe('GIVEN sign-in credentials', () => {
    describe('WHEN the user signs in', () => {
      test('THEN the credentials pass through and the auth result is returned', async () => {
        const { client } = primeSupabase([]);

        await expect(signIn('user@example.com', 'secret')).resolves.toEqual({ data: { session: null }, error: null });
        expect(client.auth.signInWithPassword).toHaveBeenCalledExactlyOnceWith({
          email: 'user@example.com',
          password: 'secret',
        });
      });
    });
  });
});

describe('signUp', () => {
  describe('GIVEN new account details', () => {
    describe('WHEN the account is registered', () => {
      test('THEN the payload pins the beta plan', async () => {
        const { client } = primeSupabase([]);

        await signUp('user@example.com', 'secret', 'Ada');

        expect(client.auth.signUp).toHaveBeenCalledExactlyOnceWith({
          email: 'user@example.com',
          password: 'secret',
          options: { data: { name: 'Ada', plan: 'beta' } },
        });
      });
    });
  });
});

describe('getSession', () => {
  describe('GIVEN an active auth client', () => {
    describe('WHEN the session is read', () => {
      test('THEN the auth result is returned', async () => {
        primeSupabase([]);

        await expect(getSession()).resolves.toEqual({ data: { session: null }, error: null });
      });
    });
  });
});

describe('setSession', () => {
  describe('GIVEN access and refresh tokens', () => {
    describe('WHEN the session is set', () => {
      test('THEN the tokens map to snake case fields', async () => {
        const { client } = primeSupabase([]);

        await setSession('access-1', 'refresh-1');

        expect(client.auth.setSession).toHaveBeenCalledExactlyOnceWith({
          access_token: 'access-1',
          refresh_token: 'refresh-1',
        });
      });
    });
  });
});

describe('completeInvitedAccount', () => {
  describe('GIVEN an invited user finishing setup', () => {
    describe('WHEN the account is completed', () => {
      test('THEN the update pins the password and beta plan', async () => {
        const { client } = primeSupabase([]);

        await completeInvitedAccount('Ada', 'secret');

        expect(client.auth.updateUser).toHaveBeenCalledExactlyOnceWith({
          password: 'secret',
          data: { name: 'Ada', plan: 'beta' },
        });
      });
    });
  });
});

describe('signOut', () => {
  describe('GIVEN a signed-in user', () => {
    describe('WHEN the user signs out', () => {
      test('THEN sign out runs and the result is returned', async () => {
        const { client } = primeSupabase([]);

        await expect(signOut()).resolves.toEqual({ error: null });
        expect(client.auth.signOut).toHaveBeenCalledTimes(1);
      });
    });
  });
});
