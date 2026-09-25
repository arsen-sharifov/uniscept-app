import { describe, expect, test, vi } from 'vitest';

import { addUserBadge, getUser, updateEmail, updatePassword, updateUserMetadata, verifyPassword } from '@api/client';
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

describe('addUserBadge', () => {
  describe('GIVEN a user whose badges were never written', () => {
    describe('WHEN a badge is awarded', () => {
      test('THEN the default badges are kept alongside the new one', async () => {
        const { client } = primeSupabase([], { user: { id: 'user-1' } });

        await addUserBadge('initiate');

        expect(client.auth.updateUser).toHaveBeenCalledExactlyOnceWith({ data: { badges: ['founder', 'initiate'] } });
      });
    });
  });

  describe('GIVEN a user who already holds the badge', () => {
    describe('WHEN it is awarded again', () => {
      test('THEN nothing is written', async () => {
        const { client } = primeSupabase([], {
          user: { id: 'user-1', user_metadata: { badges: ['founder', 'initiate'] } },
        });

        await addUserBadge('initiate');

        expect(client.auth.updateUser).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN stored badges holding an unknown id', () => {
    describe('WHEN a badge is awarded', () => {
      test('THEN the unknown id is dropped', async () => {
        const { client } = primeSupabase([], {
          user: { id: 'user-1', user_metadata: { badges: ['critic', 'retired'] } },
        });

        await addUserBadge('initiate');

        expect(client.auth.updateUser).toHaveBeenCalledExactlyOnceWith({ data: { badges: ['critic', 'initiate'] } });
      });
    });
  });

  describe('GIVEN a metadata write that fails', () => {
    describe('WHEN a badge is awarded', () => {
      test('THEN the error propagates', async () => {
        const { client } = primeSupabase([], { user: { id: 'user-1' } });
        vi.mocked(client.auth.updateUser).mockResolvedValue({
          data: { user: null },
          error: new Error('auth down'),
        } as never);

        await expect(addUserBadge('initiate')).rejects.toThrow('auth down');
      });
    });
  });
});
