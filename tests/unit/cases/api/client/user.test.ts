import { describe, expect, test, vi } from 'vitest';

import { getUser, updateEmail, updatePassword, updateUserMetadata, verifyPassword } from '@api/client';
import { primeSupabase } from '@mocks/supabase';

vi.mock('@/lib/supabase', () => import('@mocks/supabase'));

describe('getUser', () => {
  describe('GIVEN an authenticated session', () => {
    describe('WHEN the user is read', () => {
      test('THEN the auth user result is returned', async () => {
        primeSupabase([]);

        await expect(getUser()).resolves.toEqual({ data: { user: { id: 'user-1' } }, error: null });
      });
    });
  });
});

describe('updateUserMetadata', () => {
  describe('GIVEN a profile metadata update', () => {
    describe('WHEN the metadata is saved', () => {
      test('THEN the profile fields are wrapped under data', async () => {
        const { client } = primeSupabase([]);

        await updateUserMetadata({ name: 'Ada', avatarIcon: 'cat' });

        expect(client.auth.updateUser).toHaveBeenCalledExactlyOnceWith({ data: { name: 'Ada', avatarIcon: 'cat' } });
      });
    });
  });
});

describe('updateEmail', () => {
  describe('GIVEN a new email address', () => {
    describe('WHEN the email is updated', () => {
      test('THEN the update carries the new email', async () => {
        const { client } = primeSupabase([]);

        await updateEmail('new@example.com');

        expect(client.auth.updateUser).toHaveBeenCalledExactlyOnceWith({ email: 'new@example.com' });
      });
    });
  });
});

describe('verifyPassword', () => {
  describe('GIVEN the current password', () => {
    describe('WHEN the password is verified', () => {
      test('THEN the credentials pass through and the auth result is returned', async () => {
        const { client } = primeSupabase([]);

        await expect(verifyPassword('user@example.com', 'secret')).resolves.toEqual({
          data: { session: null },
          error: null,
        });
        expect(client.auth.signInWithPassword).toHaveBeenCalledExactlyOnceWith({
          email: 'user@example.com',
          password: 'secret',
        });
      });
    });
  });
});

describe('updatePassword', () => {
  describe('GIVEN a new password', () => {
    describe('WHEN the password is updated', () => {
      test('THEN the update carries the new password', async () => {
        const { client } = primeSupabase([]);

        await updatePassword('new-secret');

        expect(client.auth.updateUser).toHaveBeenCalledExactlyOnceWith({ password: 'new-secret' });
      });
    });
  });
});
