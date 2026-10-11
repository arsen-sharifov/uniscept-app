import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  INVITE_RATE_LIMIT_MAX_ATTEMPTS,
  INVITE_RATE_LIMIT_WINDOW_MS,
  PASSWORD_CHECK_RATE_LIMIT_MAX_ATTEMPTS,
} from '@constants';
import { handleChangePassword, handleDeleteAccount, handleVerifyInvite } from '@api/server';
import { primeAdminClient } from '@mocks/adminClient';
import { event } from '@mocks/events';
import { verifyPassword, WRONG_PASSWORD } from '@mocks/serverAuth';
import { primeServerClient } from '@mocks/supabaseServer';

vi.mock('@/lib/supabase/server', () => import('@mocks/supabaseServer'));
vi.mock('@api/server/utils/adminClient', () => import('@mocks/adminClient'));
vi.mock('@api/server/utils/auth', () => import('@mocks/serverAuth'));
vi.mock('@/lib/events', () => import('@mocks/events'));

const verifyRequest = (ip: string, body: unknown, headers?: Record<string, string>): Request =>
  new Request('http://localhost/auth/verify-invite', {
    method: 'POST',
    headers: { 'x-forwarded-for': ip, ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const deleteRequest = (body: unknown, headers?: Record<string, string>): Request =>
  new Request('http://localhost/auth/delete-account', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const changeRequest = (body: unknown, headers?: Record<string, string>): Request =>
  new Request('http://localhost/auth/change-password', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

let admin: ReturnType<typeof primeAdminClient>;
let response: Response;

beforeEach(() => {
  vi.stubEnv('INVITE_CODE', 'secret-code');
  verifyPassword.mockResolvedValue({ error: null });
  admin = primeAdminClient();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe('handleVerifyInvite', () => {
  describe('GIVEN a visitor who knows the invite code', () => {
    describe('WHEN the code is sent with a signup email', () => {
      beforeEach(async () => {
        response = await handleVerifyInvite(
          verifyRequest('ip-happy', { code: 'secret-code', email: '  New@User.DEV ' }),
        );
      });

      test('THEN the code is accepted', async () => {
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ valid: true });
      });

      test('THEN a signup allowance is granted for the normalized email', () => {
        expect(admin.rpc.mock.calls).toEqual([['grant_signup_allowance', { p_email: 'new@user.dev' }]]);
      });
    });

    describe('WHEN the code is sent without a valid email', () => {
      beforeEach(async () => {
        response = await handleVerifyInvite(verifyRequest('ip-no-email', { code: 'secret-code', email: 'nope' }));
      });

      test('THEN the request is rejected and no allowance is granted', () => {
        expect(response.status).toBe(400);
        expect(admin.rpc).not.toHaveBeenCalled();
      });
    });

    describe('WHEN a malformed body is sent', () => {
      beforeEach(async () => {
        response = await handleVerifyInvite(verifyRequest('ip-broken', 'not json'));
      });

      test('THEN the request is rejected and no allowance is granted', () => {
        expect(response.status).toBe(400);
        expect(admin.rpc).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a visitor guessing the invite code', () => {
    describe('WHEN a wrong code of the same length is sent', () => {
      beforeEach(async () => {
        response = await handleVerifyInvite(verifyRequest('ip-wrong', { code: 'secret-codf', email: 'new@user.dev' }));
      });

      test('THEN the code is rejected and no allowance is granted', async () => {
        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ valid: false });
        expect(admin.rpc).not.toHaveBeenCalled();
      });
    });

    describe('WHEN a code of another length is sent', () => {
      beforeEach(async () => {
        response = await handleVerifyInvite(verifyRequest('ip-short', { code: 'nope', email: 'new@user.dev' }));
      });

      test('THEN the code is rejected', () => {
        expect(response.status).toBe(403);
      });
    });

    describe('WHEN a code that is not a string is sent', () => {
      beforeEach(async () => {
        response = await handleVerifyInvite(verifyRequest('ip-number', { code: 42, email: 'new@user.dev' }));
      });

      test('THEN the code is rejected', () => {
        expect(response.status).toBe(403);
      });
    });

    describe('WHEN as many wrong codes are sent as the rate limit allows', () => {
      let statuses: number[];

      beforeEach(async () => {
        const responses = await Promise.all(
          Array.from({ length: INVITE_RATE_LIMIT_MAX_ATTEMPTS }, () =>
            handleVerifyInvite(verifyRequest('ip-guessing', { code: 'wrong-code!', email: 'new@user.dev' })),
          ),
        );
        statuses = responses.map((reply) => reply.status);
      });

      test('THEN each one is answered as a wrong code, not throttled', () => {
        expect(statuses).toEqual(Array.from({ length: INVITE_RATE_LIMIT_MAX_ATTEMPTS }, () => 403));
      });
    });
  });

  describe('GIVEN no configured invite code', () => {
    beforeEach(() => {
      vi.stubEnv('INVITE_CODE', '');
    });

    describe('WHEN an empty code is sent', () => {
      beforeEach(async () => {
        response = await handleVerifyInvite(verifyRequest('ip-unset', { code: '', email: 'new@user.dev' }));
      });

      test('THEN the code is rejected and no allowance is granted', () => {
        expect(response.status).toBe(403);
        expect(admin.rpc).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN an allowance grant the database fails', () => {
    beforeEach(() => {
      admin.rpc.mockResolvedValue({ data: null, error: { message: 'relation does not exist', code: '42P01' } });
    });

    describe('WHEN the correct code is sent', () => {
      beforeEach(async () => {
        response = await handleVerifyInvite(
          verifyRequest('ip-grant-fail', { code: 'secret-code', email: 'new@user.dev' }),
        );
      });

      test('THEN the check fails as a server error without leaking the database message', async () => {
        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({ valid: false });
        expect(event.error).toHaveBeenCalledExactlyOnceWith(
          { message: 'relation does not exist', code: '42P01' },
          { toast: false, context: 'auth.grantSignupAllowance' },
        );
      });
    });
  });

  describe('GIVEN a request sent from another site', () => {
    describe('WHEN the browser marks the request as cross-site', () => {
      beforeEach(async () => {
        response = await handleVerifyInvite(
          verifyRequest(
            'ip-cross-site',
            { code: 'secret-code', email: 'new@user.dev' },
            { 'sec-fetch-site': 'cross-site' },
          ),
        );
      });

      test('THEN the request is forbidden and no allowance is granted', () => {
        expect(response.status).toBe(403);
        expect(admin.rpc).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a client that exhausted the rate limit with wrong codes', () => {
    beforeEach(async () => {
      await Promise.all(
        Array.from({ length: INVITE_RATE_LIMIT_MAX_ATTEMPTS }, () =>
          handleVerifyInvite(verifyRequest('ip-flood', { code: 'wrong-code!', email: 'new@user.dev' })),
        ),
      );
    });

    describe('WHEN the correct code is sent within the window', () => {
      beforeEach(async () => {
        response = await handleVerifyInvite(verifyRequest('ip-flood', { code: 'secret-code', email: 'new@user.dev' }));
      });

      test('THEN the request is throttled before the code is even checked', async () => {
        expect(response.status).toBe(429);
        await expect(response.json()).resolves.toEqual({ valid: false });
        expect(admin.rpc).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a client that was throttled after too many wrong codes', () => {
    beforeEach(async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      await Promise.all(
        Array.from({ length: INVITE_RATE_LIMIT_MAX_ATTEMPTS + 1 }, () =>
          handleVerifyInvite(verifyRequest('ip-window', { code: 'wrong-code!', email: 'new@user.dev' })),
        ),
      );
    });

    describe('WHEN the correct code is sent once the window has passed', () => {
      beforeEach(async () => {
        vi.setSystemTime(Date.now() + INVITE_RATE_LIMIT_WINDOW_MS);
        response = await handleVerifyInvite(verifyRequest('ip-window', { code: 'secret-code', email: 'new@user.dev' }));
      });

      test('THEN a fresh window accepts the code', () => {
        expect(response.status).toBe(200);
      });
    });
  });
});

describe('handleDeleteAccount', () => {
  describe('GIVEN no authenticated user', () => {
    beforeEach(() => {
      primeServerClient([], { user: null });
    });

    describe('WHEN the account deletion is requested', () => {
      beforeEach(async () => {
        response = await handleDeleteAccount(deleteRequest({ password: 'correct-horse' }));
      });

      test('THEN the request is unauthorized before any password check', async () => {
        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({ error: { message: 'Unauthorized' } });
        expect(verifyPassword).not.toHaveBeenCalled();
        expect(admin.deleteUser).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN an authenticated user who knows the password', () => {
    let client: ReturnType<typeof primeServerClient>;

    beforeEach(() => {
      client = primeServerClient([], {
        user: { id: 'user-delete', email: 'delete@uniscept.dev' },
        rpc: { get_my_owned_shared_workspaces: { data: [] } },
      });
    });

    describe('WHEN the deletion is confirmed from the app', () => {
      beforeEach(async () => {
        response = await handleDeleteAccount(
          deleteRequest({ password: 'correct-horse' }, { 'sec-fetch-site': 'same-origin' }),
        );
      });

      test('THEN the deletion succeeds', async () => {
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ success: true });
      });

      test('THEN the password and the shared workspaces are checked and exactly that user is deleted', () => {
        expect(verifyPassword.mock.calls).toEqual([['delete@uniscept.dev', 'correct-horse']]);
        expect(client.rpc.mock.calls).toEqual([['get_my_owned_shared_workspaces']]);
        expect(admin.deleteUser.mock.calls).toEqual([['user-delete']]);
      });
    });

    describe('WHEN the deletion is confirmed without a password', () => {
      beforeEach(async () => {
        response = await handleDeleteAccount(deleteRequest({}));
      });

      test('THEN the request is rejected before the password check', async () => {
        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: { message: 'Invalid request' } });
        expect(verifyPassword).not.toHaveBeenCalled();
        expect(admin.deleteUser).not.toHaveBeenCalled();
      });
    });

    describe('WHEN a malformed body is sent', () => {
      beforeEach(async () => {
        response = await handleDeleteAccount(deleteRequest('not json'));
      });

      test('THEN the request is rejected before the password check', () => {
        expect(response.status).toBe(400);
        expect(verifyPassword).not.toHaveBeenCalled();
        expect(admin.deleteUser).not.toHaveBeenCalled();
      });
    });

    describe('WHEN a cross-site page submits the deletion', () => {
      beforeEach(async () => {
        response = await handleDeleteAccount(
          deleteRequest({ password: 'correct-horse' }, { 'sec-fetch-site': 'cross-site' }),
        );
      });

      test('THEN the request is forbidden and nothing is deleted', () => {
        expect(response.status).toBe(403);
        expect(verifyPassword).not.toHaveBeenCalled();
        expect(admin.deleteUser).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN an authenticated user who types a wrong password', () => {
    let client: ReturnType<typeof primeServerClient>;

    beforeEach(() => {
      client = primeServerClient([], { user: { id: 'user-delete-wrong', email: 'wrong@uniscept.dev' } });
      verifyPassword.mockResolvedValue(WRONG_PASSWORD);
    });

    describe('WHEN the deletion is confirmed', () => {
      beforeEach(async () => {
        response = await handleDeleteAccount(deleteRequest({ password: 'guess' }));
      });

      test('THEN the invalid credentials code comes back before the workspaces are checked and nothing is deleted', async () => {
        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
          error: { message: 'Invalid credentials', code: 'invalid_credentials' },
        });
        expect(client.rpc).not.toHaveBeenCalled();
        expect(admin.deleteUser).not.toHaveBeenCalled();
        expect(event.error).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN an owner of a workspace that other members still use', () => {
    beforeEach(() => {
      primeServerClient([], {
        user: { id: 'user-delete-owner', email: 'owner@uniscept.dev' },
        rpc: { get_my_owned_shared_workspaces: { data: [{ id: 'ws-shared', name: 'Shared space' }] } },
      });
    });

    describe('WHEN the deletion is confirmed with the right password', () => {
      beforeEach(async () => {
        response = await handleDeleteAccount(deleteRequest({ password: 'correct-horse' }));
      });

      test('THEN the deletion is refused with the shared workspaces code and nothing is deleted', async () => {
        expect(response.status).toBe(409);
        await expect(response.json()).resolves.toEqual({
          error: { message: 'Account owns shared workspaces', code: 'owns_shared_workspaces' },
        });
        expect(admin.deleteUser).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a shared workspace check the database fails to answer', () => {
    const checkFailure = { message: 'function does not exist', code: '42883' };

    beforeEach(() => {
      primeServerClient([], {
        user: { id: 'user-delete-check', email: 'check@uniscept.dev' },
        rpc: { get_my_owned_shared_workspaces: { error: checkFailure } },
      });
    });

    describe('WHEN the deletion is confirmed', () => {
      beforeEach(async () => {
        response = await handleDeleteAccount(deleteRequest({ password: 'correct-horse' }));
      });

      test('THEN a generic server error comes back, the failure is reported and nothing is deleted', async () => {
        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({ error: { message: 'Account deletion failed' } });
        expect(event.error).toHaveBeenCalledExactlyOnceWith(checkFailure, {
          toast: false,
          context: 'auth.checkSharedWorkspaces',
        });
        expect(admin.deleteUser).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a password check the auth server fails to answer', () => {
    beforeEach(() => {
      primeServerClient([], { user: { id: 'user-delete-outage', email: 'outage@uniscept.dev' } });
      verifyPassword.mockResolvedValue({ error: { code: 'unexpected_failure', status: 500 } });
    });

    describe('WHEN the deletion is confirmed', () => {
      beforeEach(async () => {
        response = await handleDeleteAccount(deleteRequest({ password: 'correct-horse' }));
      });

      test('THEN a generic server error comes back, the failure is reported and nothing is deleted', async () => {
        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
          error: { message: 'Password check failed', code: 'unexpected_failure' },
        });
        expect(event.error).toHaveBeenCalledExactlyOnceWith(
          { code: 'unexpected_failure', status: 500 },
          { toast: false, context: 'auth.verifyPassword' },
        );
        expect(admin.deleteUser).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a password check the auth server throttles', () => {
    beforeEach(() => {
      primeServerClient([], { user: { id: 'user-delete-throttled', email: 'throttled@uniscept.dev' } });
      verifyPassword.mockResolvedValue({ error: { code: 'over_request_rate_limit', status: 429 } });
    });

    describe('WHEN the deletion is confirmed', () => {
      beforeEach(async () => {
        response = await handleDeleteAccount(deleteRequest({ password: 'correct-horse' }));
      });

      test('THEN the throttle reaches the client as a rate limit and nothing is deleted', async () => {
        expect(response.status).toBe(429);
        await expect(response.json()).resolves.toEqual({
          error: { message: 'Password check failed', code: 'over_request_rate_limit' },
        });
        expect(admin.deleteUser).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a user who exhausted the password attempts', () => {
    beforeEach(async () => {
      primeServerClient([], { user: { id: 'user-delete-flood', email: 'flood@uniscept.dev' } });
      verifyPassword.mockResolvedValue(WRONG_PASSWORD);
      await Promise.all(
        Array.from({ length: PASSWORD_CHECK_RATE_LIMIT_MAX_ATTEMPTS }, () =>
          handleDeleteAccount(deleteRequest({ password: 'guess' })),
        ),
      );
      verifyPassword.mockClear();
    });

    describe('WHEN another deletion is confirmed', () => {
      beforeEach(async () => {
        response = await handleDeleteAccount(deleteRequest({ password: 'correct-horse' }));
      });

      test('THEN the request is throttled before the password is checked', () => {
        expect(response.status).toBe(429);
        expect(verifyPassword).not.toHaveBeenCalled();
        expect(admin.deleteUser).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the password change is attempted instead', () => {
      beforeEach(async () => {
        response = await handleChangePassword(
          changeRequest({ currentPassword: 'correct-horse', newPassword: 'new-secret-1' }),
        );
      });

      test('THEN the shared limit throttles it as well', () => {
        expect(response.status).toBe(429);
        expect(verifyPassword).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a failing admin deletion', () => {
    beforeEach(() => {
      primeServerClient([], { user: { id: 'user-delete-admin', email: 'admin-fail@uniscept.dev' } });
      admin.deleteUser.mockResolvedValue({ data: null, error: { message: 'admin api unavailable' } });
    });

    describe('WHEN the deletion is confirmed', () => {
      beforeEach(async () => {
        response = await handleDeleteAccount(deleteRequest({ password: 'correct-horse' }));
      });

      test('THEN the failure surfaces as a generic server error', async () => {
        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({ error: { message: 'Account deletion failed' } });
        expect(event.error).toHaveBeenCalledExactlyOnceWith(
          { message: 'admin api unavailable' },
          { toast: false, context: 'auth.deleteAccount' },
        );
      });
    });
  });
});

describe('handleChangePassword', () => {
  describe('GIVEN no authenticated user', () => {
    beforeEach(() => {
      primeServerClient([], { user: null });
    });

    describe('WHEN a new password is submitted', () => {
      beforeEach(async () => {
        response = await handleChangePassword(
          changeRequest({ currentPassword: 'old-secret', newPassword: 'new-secret-1' }),
        );
      });

      test('THEN the request is unauthorized before any password check', async () => {
        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({ error: { message: 'Unauthorized' } });
        expect(verifyPassword).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN an authenticated user who knows the current password', () => {
    let client: ReturnType<typeof primeServerClient>;

    beforeEach(() => {
      client = primeServerClient([], { user: { id: 'user-change', email: 'change@uniscept.dev' } });
    });

    describe('WHEN a new password is submitted from the app', () => {
      beforeEach(async () => {
        response = await handleChangePassword(
          changeRequest(
            { currentPassword: 'old-secret', newPassword: 'new-secret-1' },
            { 'sec-fetch-site': 'same-origin' },
          ),
        );
      });

      test('THEN the current password is checked and the session updates with both passwords', async () => {
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ success: true });
        expect(verifyPassword.mock.calls).toEqual([['change@uniscept.dev', 'old-secret']]);
        expect(client.auth.updateUser).toHaveBeenCalledExactlyOnceWith({
          password: 'new-secret-1',
          current_password: 'old-secret',
        });
      });
    });

    describe('WHEN a cross-site page submits the change', () => {
      beforeEach(async () => {
        response = await handleChangePassword(
          changeRequest(
            { currentPassword: 'old-secret', newPassword: 'new-secret-1' },
            { 'sec-fetch-site': 'cross-site' },
          ),
        );
      });

      test('THEN the request is forbidden and nothing is updated', () => {
        expect(response.status).toBe(403);
        expect(client.auth.updateUser).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the change is submitted without a new password', () => {
      beforeEach(async () => {
        response = await handleChangePassword(changeRequest({ currentPassword: 'old-secret' }));
      });

      test('THEN the request is rejected before the password check', () => {
        expect(response.status).toBe(400);
        expect(verifyPassword).not.toHaveBeenCalled();
        expect(client.auth.updateUser).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the change is submitted without the current password', () => {
      beforeEach(async () => {
        response = await handleChangePassword(changeRequest({ newPassword: 'new-secret-1' }));
      });

      test('THEN the request is rejected and nothing is updated', () => {
        expect(response.status).toBe(400);
        expect(verifyPassword).not.toHaveBeenCalled();
        expect(client.auth.updateUser).not.toHaveBeenCalled();
      });
    });

    describe('WHEN a malformed body is sent', () => {
      beforeEach(async () => {
        response = await handleChangePassword(changeRequest('not json'));
      });

      test('THEN the request is rejected before the password check', () => {
        expect(response.status).toBe(400);
        expect(verifyPassword).not.toHaveBeenCalled();
        expect(client.auth.updateUser).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN an authenticated user who types a wrong current password', () => {
    let client: ReturnType<typeof primeServerClient>;

    beforeEach(() => {
      client = primeServerClient([], { user: { id: 'user-change-wrong', email: 'change-wrong@uniscept.dev' } });
      verifyPassword.mockResolvedValue(WRONG_PASSWORD);
    });

    describe('WHEN a new password is submitted', () => {
      beforeEach(async () => {
        response = await handleChangePassword(changeRequest({ currentPassword: 'guess', newPassword: 'new-secret-1' }));
      });

      test('THEN the invalid credentials code comes back and the password stays', async () => {
        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
          error: { message: 'Invalid credentials', code: 'invalid_credentials' },
        });
        expect(client.auth.updateUser).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a new password the auth server refuses', () => {
    beforeEach(() => {
      const client = primeServerClient([], { user: { id: 'user-change-weak', email: 'weak@uniscept.dev' } });
      vi.mocked(client.auth.updateUser).mockResolvedValue({
        data: { user: null },
        error: { code: 'weak_password', status: 422, message: 'Password is known to be weak' },
      } as never);
    });

    describe('WHEN it is submitted', () => {
      beforeEach(async () => {
        response = await handleChangePassword(
          changeRequest({ currentPassword: 'old-secret', newPassword: 'password1' }),
        );
      });

      test('THEN the refusal keeps its status and code behind a generic message and is reported', async () => {
        expect(response.status).toBe(422);
        await expect(response.json()).resolves.toEqual({
          error: { message: 'Password update failed', code: 'weak_password' },
        });
        expect(event.error).toHaveBeenCalledExactlyOnceWith(
          { code: 'weak_password', status: 422, message: 'Password is known to be weak' },
          { toast: false, context: 'auth.changePassword' },
        );
      });
    });
  });

  describe('GIVEN a password update that never reaches the auth server', () => {
    beforeEach(() => {
      const client = primeServerClient([], { user: { id: 'user-change-offline', email: 'offline@uniscept.dev' } });
      vi.mocked(client.auth.updateUser).mockResolvedValue({
        data: { user: null },
        error: { status: 0, message: 'fetch failed' },
      } as never);
    });

    describe('WHEN it is submitted', () => {
      beforeEach(async () => {
        response = await handleChangePassword(
          changeRequest({ currentPassword: 'old-secret', newPassword: 'new-secret-1' }),
        );
      });

      test('THEN a generic server error comes back', async () => {
        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({ error: { message: 'Password update failed' } });
      });
    });
  });
});
