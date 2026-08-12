import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { handleWorkspaceInvite } from '@api/server';
import { getAdminClient } from '@mocks/adminClient';
import { primeSupabase } from '@mocks/supabase';
import { createClient as createServerClient } from '@mocks/supabaseServer';

vi.mock('@/lib/supabase/server', () => import('@mocks/supabaseServer'));
vi.mock('@api/server/utils', () => import('@mocks/adminClient'));

const inviteUserByEmail = vi.fn();

const inviteRequest = (body: unknown): Request =>
  new Request('http://localhost/api/auth/workspace-invite', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const primeServer = (
  results: Array<{ data?: unknown; error?: unknown }>,
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null,
) => {
  const { client } = primeSupabase(results, { user });
  vi.mocked(createServerClient).mockResolvedValue(client as never);
  vi.mocked(getAdminClient).mockReturnValue({ auth: { admin: { inviteUserByEmail } } } as never);

  return client;
};

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('handleWorkspaceInvite', () => {
  describe('GIVEN a malformed request body', () => {
    describe('WHEN the invite is submitted', () => {
      test('THEN the request is rejected', async () => {
        const response = await handleWorkspaceInvite(inviteRequest('not json'));

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: { message: 'Invalid request' } });
      });
    });
  });

  describe('GIVEN a request without a workspace id', () => {
    describe('WHEN the invite is submitted', () => {
      test('THEN the request is rejected', async () => {
        const response = await handleWorkspaceInvite(inviteRequest({ email: 'a@b.dev', roleId: 'role-1' }));

        expect(response.status).toBe(400);
      });
    });
  });

  describe('GIVEN a request without an email', () => {
    describe('WHEN the invite is submitted', () => {
      test('THEN the request is rejected', async () => {
        const response = await handleWorkspaceInvite(inviteRequest({ workspaceId: 'ws-1', roleId: 'role-1' }));

        expect(response.status).toBe(400);
      });
    });
  });

  describe('GIVEN a request without a role id', () => {
    describe('WHEN the invite is submitted', () => {
      test('THEN the request is rejected', async () => {
        const response = await handleWorkspaceInvite(inviteRequest({ workspaceId: 'ws-1', email: 'a@b.dev' }));

        expect(response.status).toBe(400);
      });
    });
  });

  describe('GIVEN no authenticated user', () => {
    let client: ReturnType<typeof primeServer>;

    beforeEach(() => {
      client = primeServer([], null);
    });

    describe('WHEN the invite is submitted', () => {
      test('THEN the request is unauthorized and no invitation is created', async () => {
        const response = await handleWorkspaceInvite(
          inviteRequest({ workspaceId: 'ws-1', email: 'a@b.dev', roleId: 'role-1' }),
        );

        expect(response.status).toBe(401);
        expect(client.rpc).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN an invitation rpc denied by permissions', () => {
    beforeEach(() => {
      const client = primeServer([], { id: 'user-1' });
      vi.mocked(client.rpc).mockResolvedValue({
        data: null,
        error: { message: 'permission denied', code: '42501' },
      } as never);
    });

    describe('WHEN the invite is submitted', () => {
      test('THEN the pg code maps to a forbidden response and no email is sent', async () => {
        const response = await handleWorkspaceInvite(
          inviteRequest({ workspaceId: 'ws-1', email: 'a@b.dev', roleId: 'role-1' }),
        );

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({
          error: { message: 'permission denied', code: '42501' },
        });
        expect(inviteUserByEmail).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN an invitation rpc failing with an unknown code', () => {
    beforeEach(() => {
      const client = primeServer([], { id: 'user-1' });
      vi.mocked(client.rpc).mockResolvedValue({
        data: null,
        error: { message: 'boom', code: 'XX000' },
      } as never);
    });

    describe('WHEN the invite is submitted', () => {
      test('THEN the response falls back to a server error', async () => {
        const response = await handleWorkspaceInvite(
          inviteRequest({ workspaceId: 'ws-1', email: 'a@b.dev', roleId: 'role-1' }),
        );

        expect(response.status).toBe(500);
      });
    });
  });

  describe('GIVEN a named inviter and an existing workspace', () => {
    let client: ReturnType<typeof primeServer>;

    beforeEach(() => {
      client = primeServer([{ data: { name: 'Acme Space' } }], {
        id: 'user-1',
        email: 'owner@acme.dev',
        user_metadata: { name: 'Owner Name' },
      });
      vi.mocked(client.rpc).mockResolvedValue({ data: 'invitation-1', error: null } as never);
      inviteUserByEmail.mockResolvedValue({ data: {}, error: null });
    });

    describe('WHEN the invite is submitted', () => {
      test('THEN the invite email carries the workspace metadata', async () => {
        const response = await handleWorkspaceInvite(
          inviteRequest({ workspaceId: 'ws-1', email: 'teammate@acme.dev', roleId: 'role-1' }),
        );

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ ok: true });
        expect(inviteUserByEmail.mock.calls).toEqual([
          [
            'teammate@acme.dev',
            {
              redirectTo: 'http://localhost:3000/join',
              data: {
                name: 'teammate',
                workspaceName: 'Acme Space',
                workspaceInitial: 'A',
                invitedByName: 'Owner Name',
              },
            },
          ],
        ]);
      });

      test('THEN the invitation rpc receives the request payload', async () => {
        await handleWorkspaceInvite(
          inviteRequest({ workspaceId: 'ws-1', email: 'teammate@acme.dev', roleId: 'role-1' }),
        );

        expect(client.rpc.mock.calls).toEqual([
          [
            'create_workspace_invitation',
            { p_workspace_id: 'ws-1', p_email: 'teammate@acme.dev', p_role_id: 'role-1' },
          ],
        ]);
      });
    });
  });

  describe('GIVEN an inviter without a display name', () => {
    beforeEach(() => {
      const client = primeServer([{ data: { name: 'Acme Space' } }], {
        id: 'user-1',
        email: 'owner@acme.dev',
        user_metadata: {},
      });
      vi.mocked(client.rpc).mockResolvedValue({ data: 'invitation-1', error: null } as never);
      inviteUserByEmail.mockResolvedValue({ data: {}, error: null });
    });

    describe('WHEN the invite is submitted', () => {
      test('THEN the email prefix stands in for the inviter name', async () => {
        await handleWorkspaceInvite(
          inviteRequest({ workspaceId: 'ws-1', email: 'teammate@acme.dev', roleId: 'role-1' }),
        );

        expect(inviteUserByEmail.mock.calls[0]?.[1].data.invitedByName).toBe('owner');
      });
    });
  });

  describe('GIVEN a workspace lookup without a row', () => {
    beforeEach(() => {
      const client = primeServer([{ data: null }], { id: 'user-1', email: 'owner@acme.dev' });
      vi.mocked(client.rpc).mockResolvedValue({ data: 'invitation-1', error: null } as never);
      inviteUserByEmail.mockResolvedValue({ data: {}, error: null });
    });

    describe('WHEN the invite is submitted', () => {
      test('THEN the email falls back to an empty workspace name', async () => {
        await handleWorkspaceInvite(
          inviteRequest({ workspaceId: 'ws-1', email: 'teammate@acme.dev', roleId: 'role-1' }),
        );

        expect(inviteUserByEmail.mock.calls[0]?.[1].data).toMatchObject({ workspaceName: '', workspaceInitial: '' });
      });
    });
  });

  describe('GIVEN an invitee that already has an account', () => {
    let client: ReturnType<typeof primeServer>;

    beforeEach(() => {
      client = primeServer([{ data: { name: 'Acme Space' } }], { id: 'user-1', email: 'owner@acme.dev' });
      vi.mocked(client.rpc).mockResolvedValue({ data: 'invitation-1', error: null } as never);
      inviteUserByEmail.mockResolvedValue({ data: null, error: { message: 'User already registered' } });
    });

    describe('WHEN the invite email is refused as already registered', () => {
      test('THEN the invitation still succeeds without a rollback', async () => {
        const response = await handleWorkspaceInvite(
          inviteRequest({ workspaceId: 'ws-1', email: 'teammate@acme.dev', roleId: 'role-1' }),
        );

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ ok: true });
        expect(client.rpc).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('GIVEN a failing invite email', () => {
    let client: ReturnType<typeof primeServer>;

    beforeEach(() => {
      client = primeServer([{ data: { name: 'Acme Space' } }], { id: 'user-1', email: 'owner@acme.dev' });
      vi.mocked(client.rpc).mockResolvedValue({ data: 'invitation-1', error: null } as never);
      inviteUserByEmail.mockResolvedValue({ data: null, error: { message: 'smtp unreachable' } });
    });

    describe('WHEN the invite is submitted', () => {
      test('THEN the invitation is rolled back and the failure surfaces', async () => {
        const response = await handleWorkspaceInvite(
          inviteRequest({ workspaceId: 'ws-1', email: 'teammate@acme.dev', roleId: 'role-1' }),
        );

        expect(response.status).toBe(502);
        await expect(response.json()).resolves.toEqual({ error: { message: 'smtp unreachable' } });
        expect(client.rpc.mock.calls[1]).toEqual(['revoke_workspace_invitation', { p_invitation_id: 'invitation-1' }]);
      });
    });
  });

  describe('GIVEN a failing invite email and a failing rollback', () => {
    beforeEach(() => {
      const client = primeServer([{ data: { name: 'Acme Space' } }], { id: 'user-1', email: 'owner@acme.dev' });
      vi.mocked(client.rpc)
        .mockResolvedValueOnce({ data: 'invitation-1', error: null } as never)
        .mockResolvedValueOnce({ data: null, error: { message: 'revoke failed' } } as never);
      inviteUserByEmail.mockResolvedValue({ data: null, error: { message: 'smtp unreachable' } });
    });

    describe('WHEN the invite is submitted', () => {
      test('THEN both failures are reported and the response stays a bad gateway', async () => {
        const response = await handleWorkspaceInvite(
          inviteRequest({ workspaceId: 'ws-1', email: 'teammate@acme.dev', roleId: 'role-1' }),
        );

        expect(response.status).toBe(502);
        expect(vi.mocked(console.error).mock.calls).toEqual([
          ['[workspaceInvite] invite email failed', 'smtp unreachable'],
          ['[workspaceInvite] invitation rollback failed', 'revoke failed'],
        ]);
      });
    });
  });
});
