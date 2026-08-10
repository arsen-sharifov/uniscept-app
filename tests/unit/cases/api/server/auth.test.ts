import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { INVITE_RATE_LIMIT_MAX_ATTEMPTS } from '@constants';
import { handleDeleteAccount, handleVerifyInvite } from '@api/server';
import { getAdminClient } from '@mocks/adminClient';
import { primeSupabase } from '@mocks/supabase';
import { createClient as createServerClient } from '@mocks/supabaseServer';

vi.mock('@/lib/supabase/server', () => import('@mocks/supabaseServer'));
vi.mock('@api/server/utils', () => import('@mocks/adminClient'));

const deleteUser = vi.fn();

const primeServer = (user: { id: string } | null) => {
  const { client } = primeSupabase([], { user });
  vi.mocked(createServerClient).mockResolvedValue(client as never);
  vi.mocked(getAdminClient).mockReturnValue({ auth: { admin: { deleteUser } } } as never);
};

beforeEach(() => {
  vi.stubEnv('INVITE_CODE', 'secret-code');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('handleVerifyInvite', () => {
  describe('GIVEN the correct invite code', () => {
    describe('WHEN the invite is verified', () => {
      test('THEN the code is accepted', async () => {
        const request = new Request('http://localhost/api/auth/verify-invite', {
          method: 'POST',
          headers: { 'x-forwarded-for': 'ip-happy' },
          body: JSON.stringify({ code: 'secret-code' }),
        });

        const response = await handleVerifyInvite(request);

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ valid: true });
      });
    });
  });

  describe('GIVEN a wrong code of the same length', () => {
    describe('WHEN the invite is verified', () => {
      test('THEN the code is rejected', async () => {
        const request = new Request('http://localhost/api/auth/verify-invite', {
          method: 'POST',
          headers: { 'x-forwarded-for': 'ip-wrong' },
          body: JSON.stringify({ code: 'secret-codf' }),
        });

        const response = await handleVerifyInvite(request);

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ valid: false });
      });
    });
  });

  describe('GIVEN a code with a different length', () => {
    describe('WHEN the invite is verified', () => {
      test('THEN the code is rejected', async () => {
        const request = new Request('http://localhost/api/auth/verify-invite', {
          method: 'POST',
          headers: { 'x-forwarded-for': 'ip-short' },
          body: JSON.stringify({ code: 'nope' }),
        });

        const response = await handleVerifyInvite(request);

        expect(response.status).toBe(403);
      });
    });
  });

  describe('GIVEN a non-string code', () => {
    describe('WHEN the invite is verified', () => {
      test('THEN the code is rejected', async () => {
        const request = new Request('http://localhost/api/auth/verify-invite', {
          method: 'POST',
          headers: { 'x-forwarded-for': 'ip-number' },
          body: JSON.stringify({ code: 42 }),
        });

        const response = await handleVerifyInvite(request);

        expect(response.status).toBe(403);
      });
    });
  });

  describe('GIVEN a malformed request body', () => {
    describe('WHEN the invite is verified', () => {
      test('THEN the request is rejected', async () => {
        const request = new Request('http://localhost/api/auth/verify-invite', {
          method: 'POST',
          headers: { 'x-forwarded-for': 'ip-broken' },
          body: 'not json',
        });

        const response = await handleVerifyInvite(request);

        expect(response.status).toBe(403);
      });
    });
  });

  describe('GIVEN no configured invite code', () => {
    describe('WHEN the invite is verified', () => {
      test('THEN every code is rejected', async () => {
        vi.stubEnv('INVITE_CODE', '');

        const request = new Request('http://localhost/api/auth/verify-invite', {
          method: 'POST',
          headers: { 'x-forwarded-for': 'ip-unset' },
          body: JSON.stringify({ code: '' }),
        });

        const response = await handleVerifyInvite(request);

        expect(response.status).toBe(403);
      });
    });
  });

  describe('GIVEN a client identified through x-real-ip', () => {
    describe('WHEN the invite is verified', () => {
      test('THEN the code is accepted', async () => {
        const request = new Request('http://localhost/api/auth/verify-invite', {
          method: 'POST',
          headers: { 'x-real-ip': 'ip-real' },
          body: JSON.stringify({ code: 'secret-code' }),
        });

        const response = await handleVerifyInvite(request);

        expect(response.status).toBe(200);
      });
    });
  });

  describe('GIVEN a client without ip headers', () => {
    describe('WHEN the invite is verified', () => {
      test('THEN the code is accepted through the fallback bucket', async () => {
        const request = new Request('http://localhost/api/auth/verify-invite', {
          method: 'POST',
          body: JSON.stringify({ code: 'secret-code' }),
        });

        const response = await handleVerifyInvite(request);

        expect(response.status).toBe(200);
      });
    });
  });

  describe('GIVEN a client that exhausted the rate limit', () => {
    describe('WHEN the limit is exceeded within the window', () => {
      test('THEN the request is throttled before the code is even checked', async () => {
        const attempts = Array.from({ length: INVITE_RATE_LIMIT_MAX_ATTEMPTS }, () =>
          handleVerifyInvite(
            new Request('http://localhost/api/auth/verify-invite', {
              method: 'POST',
              headers: { 'x-forwarded-for': 'ip-flood' },
              body: JSON.stringify({ code: 'wrong-code!' }),
            }),
          ),
        );
        const allowed = await Promise.all(attempts);

        expect(allowed.every((response) => response.status === 403)).toBe(true);

        const throttled = await handleVerifyInvite(
          new Request('http://localhost/api/auth/verify-invite', {
            method: 'POST',
            headers: { 'x-forwarded-for': 'ip-flood' },
            body: JSON.stringify({ code: 'secret-code' }),
          }),
        );

        expect(throttled.status).toBe(429);
        await expect(throttled.json()).resolves.toEqual({ valid: false });
      });
    });
  });
});

describe('handleDeleteAccount', () => {
  describe('GIVEN no authenticated user', () => {
    beforeEach(() => {
      primeServer(null);
    });

    describe('WHEN the account deletion is requested', () => {
      test('THEN the request is unauthorized and nothing is deleted', async () => {
        const response = await handleDeleteAccount();

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
        expect(deleteUser).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN an authenticated user', () => {
    beforeEach(() => {
      primeServer({ id: 'user-7' });
      deleteUser.mockResolvedValue({ data: {}, error: null });
    });

    describe('WHEN the account deletion is requested', () => {
      test('THEN the admin api deletes exactly that user', async () => {
        const response = await handleDeleteAccount();

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ success: true });
        expect(deleteUser.mock.calls).toEqual([['user-7']]);
      });
    });
  });

  describe('GIVEN a failing admin deletion', () => {
    beforeEach(() => {
      primeServer({ id: 'user-7' });
      deleteUser.mockResolvedValue({ data: null, error: { message: 'admin api unavailable' } });
    });

    describe('WHEN the account deletion is requested', () => {
      test('THEN the failure surfaces as a server error', async () => {
        const response = await handleDeleteAccount();

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({ error: 'admin api unavailable' });
      });
    });
  });
});
