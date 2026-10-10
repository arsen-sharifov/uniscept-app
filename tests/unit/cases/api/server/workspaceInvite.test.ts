import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { MAX_NAME_LENGTH, WORKSPACE_INVITE_RATE_LIMIT_MAX_ATTEMPTS } from '@constants';
import { handleWorkspaceInvite } from '@api/server';
import { primeAdminClient } from '@mocks/adminClient';
import { event } from '@mocks/events';
import { INVITER, WORKSPACE_INVITE_REQUEST, INVITE_RPCS } from '@mocks/roles';
import { WORKSPACE_NAME_LOOKUP } from '@mocks/rows';
import { PERMISSION_DENIED_ERROR } from '@mocks/supabase';
import { primeServerClient } from '@mocks/supabaseServer';

vi.mock('@/lib/supabase/server', () => import('@mocks/supabaseServer'));
vi.mock('@api/server/utils/adminClient', () => import('@mocks/adminClient'));
vi.mock('@/lib/events', () => import('@mocks/events'));

const inviteRequest = (body: unknown, headers?: Record<string, string>): Request =>
  new Request('http://localhost/api/auth/workspace-invite', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

let admin: ReturnType<typeof primeAdminClient>;
let response: Response;

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
  admin = primeAdminClient();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('handleWorkspaceInvite', () => {
  describe('GIVEN a signed-in inviter', () => {
    let client: ReturnType<typeof primeServerClient>;

    beforeEach(() => {
      client = primeServerClient([], { user: INVITER, rpc: INVITE_RPCS });
    });

    describe('WHEN a malformed body is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest('not json'));
      });

      test('THEN the request is rejected before any invitation is created', async () => {
        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: { message: 'Invalid request' } });
        expect(client.rpc).not.toHaveBeenCalled();
      });
    });

    describe('WHEN an invite without a workspace id is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest({ email: 'teammate@acme.dev', roleId: 'role-1' }));
      });

      test('THEN the request is rejected before any invitation is created', () => {
        expect(response.status).toBe(400);
        expect(client.rpc).not.toHaveBeenCalled();
      });
    });

    describe('WHEN an invite without an email is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest({ workspaceId: 'ws-1', roleId: 'role-1' }));
      });

      test('THEN the request is rejected before any invitation is created', () => {
        expect(response.status).toBe(400);
        expect(client.rpc).not.toHaveBeenCalled();
      });
    });

    describe('WHEN an invite with a malformed email is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest({ ...WORKSPACE_INVITE_REQUEST, email: 'not an email' }));
      });

      test('THEN the request is rejected before any invitation is created', () => {
        expect(response.status).toBe(400);
        expect(client.rpc).not.toHaveBeenCalled();
      });
    });

    describe('WHEN an invite without a role id is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest({ workspaceId: 'ws-1', email: 'teammate@acme.dev' }));
      });

      test('THEN the request is rejected before any invitation is created', () => {
        expect(response.status).toBe(400);
        expect(client.rpc).not.toHaveBeenCalled();
      });
    });

    describe('WHEN a cross-site page submits the invite', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(
          inviteRequest(WORKSPACE_INVITE_REQUEST, { 'sec-fetch-site': 'cross-site' }),
        );
      });

      test('THEN the request is forbidden before any invitation is created', () => {
        expect(response.status).toBe(403);
        expect(client.rpc).not.toHaveBeenCalled();
        expect(admin.inviteUserByEmail).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN no authenticated user', () => {
    let client: ReturnType<typeof primeServerClient>;

    beforeEach(() => {
      client = primeServerClient([], { user: null, rpc: INVITE_RPCS });
    });

    describe('WHEN the invite is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest(WORKSPACE_INVITE_REQUEST));
      });

      test('THEN the request is unauthorized and no invitation is created', () => {
        expect(response.status).toBe(401);
        expect(client.rpc).not.toHaveBeenCalled();
      });
    });

    describe('WHEN a malformed body is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest('not json'));
      });

      test('THEN the request is unauthorized before the body is validated', async () => {
        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({ error: { message: 'Unauthorized' } });
      });
    });
  });

  describe('GIVEN an inviter the database refuses to let manage members', () => {
    beforeEach(() => {
      primeServerClient([], {
        user: { ...INVITER, id: 'user-denied' },
        rpc: {
          get_workspace_invitations: { error: PERMISSION_DENIED_ERROR },
          create_workspace_invitation: { error: PERMISSION_DENIED_ERROR },
        },
      });
    });

    describe('WHEN the invite is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest(WORKSPACE_INVITE_REQUEST));
      });

      test('THEN the pg code maps to a forbidden response without the database message and no email is sent', async () => {
        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: { message: 'Invitation failed', code: '42501' } });
        expect(admin.inviteUserByEmail).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a workspace that already holds the maximum of pending invitations', () => {
    beforeEach(() => {
      primeServerClient([], {
        user: { ...INVITER, id: 'user-cap' },
        rpc: {
          ...INVITE_RPCS,
          create_workspace_invitation: { error: { message: 'Too many pending invitations', code: '54000' } },
        },
      });
    });

    describe('WHEN another invite is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(
          inviteRequest({ ...WORKSPACE_INVITE_REQUEST, email: 'one-too-many@acme.dev' }),
        );
      });

      test('THEN the limit code reaches the client as a conflict and no email is sent', async () => {
        expect(response.status).toBe(409);
        await expect(response.json()).resolves.toEqual({ error: { message: 'Invitation failed', code: '54000' } });
        expect(admin.inviteUserByEmail).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN an invitation rpc failing with an unknown code', () => {
    beforeEach(() => {
      primeServerClient([], {
        user: { ...INVITER, id: 'user-unknown-code' },
        rpc: { ...INVITE_RPCS, create_workspace_invitation: { error: { message: 'boom', code: 'XX000' } } },
      });
    });

    describe('WHEN the invite is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest(WORKSPACE_INVITE_REQUEST));
      });

      test('THEN the response falls back to a server error', () => {
        expect(response.status).toBe(500);
      });
    });
  });

  describe('GIVEN a named inviter and an existing workspace', () => {
    let client: ReturnType<typeof primeServerClient>;

    beforeEach(() => {
      client = primeServerClient(WORKSPACE_NAME_LOOKUP, {
        user: { ...INVITER, id: 'user-named', user_metadata: { name: 'Owner Name' } },
        rpc: INVITE_RPCS,
      });
    });

    describe('WHEN the invite is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest(WORKSPACE_INVITE_REQUEST));
      });

      test('THEN the invite email carries the workspace metadata', async () => {
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ ok: true });
        expect(admin.inviteUserByEmail.mock.calls).toEqual([
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

      test('THEN a signup allowance for the invitee is granted before the invitation email is sent', () => {
        expect(admin.rpc).toHaveBeenCalledExactlyOnceWith('grant_signup_allowance', { p_email: 'teammate@acme.dev' });
        expect(admin.rpc.mock.invocationCallOrder[0]).toBeLessThan(
          admin.inviteUserByEmail.mock.invocationCallOrder[0]!,
        );
      });

      test('THEN the pending invitations are read before the invitation rpc receives the request payload', () => {
        expect(client.rpc.mock.calls).toEqual([
          ['get_workspace_invitations', { p_workspace_id: 'ws-1' }],
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
      primeServerClient(WORKSPACE_NAME_LOOKUP, {
        user: { ...INVITER, id: 'user-unnamed', user_metadata: {} },
        rpc: INVITE_RPCS,
      });
    });

    describe('WHEN the invite is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest(WORKSPACE_INVITE_REQUEST));
      });

      test('THEN the email prefix stands in for the inviter name', () => {
        expect(admin.inviteUserByEmail.mock.calls[0]?.[1].data.invitedByName).toBe('owner');
      });
    });
  });

  describe('GIVEN an inviter whose metadata name is not a string', () => {
    beforeEach(() => {
      primeServerClient(WORKSPACE_NAME_LOOKUP, {
        user: { id: 'user-object-name', email: 'owner@acme.dev', user_metadata: { name: { first: 'Owner' } } },
        rpc: INVITE_RPCS,
      });
    });

    describe('WHEN the invite is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest(WORKSPACE_INVITE_REQUEST));
      });

      test('THEN the email prefix stands in for the inviter name', () => {
        expect(response.status).toBe(200);
        expect(admin.inviteUserByEmail.mock.calls[0]?.[1].data.invitedByName).toBe('owner');
      });
    });
  });

  describe('GIVEN a workspace lookup without a row', () => {
    beforeEach(() => {
      primeServerClient([{ data: null }], { user: { ...INVITER, id: 'user-no-workspace' }, rpc: INVITE_RPCS });
    });

    describe('WHEN the invite is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest(WORKSPACE_INVITE_REQUEST));
      });

      test('THEN the email falls back to an empty workspace name', () => {
        expect(admin.inviteUserByEmail.mock.calls[0]?.[1].data).toMatchObject({
          workspaceName: '',
          workspaceInitial: '',
        });
      });
    });
  });

  describe('GIVEN a workspace whose name starts with an emoji', () => {
    beforeEach(() => {
      primeServerClient([{ data: { name: '🚀 launch crew' } }], {
        user: { id: 'user-emoji', email: 'owner@acme.dev' },
        rpc: INVITE_RPCS,
      });
    });

    describe('WHEN the invite is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest(WORKSPACE_INVITE_REQUEST));
      });

      test('THEN the email initial is the whole emoji instead of half of it', () => {
        expect(admin.inviteUserByEmail.mock.calls[0]?.[1].data.workspaceInitial).toBe('🚀');
      });
    });
  });

  describe('GIVEN an inviter and a workspace whose names carry markup, tabs and padding', () => {
    beforeEach(() => {
      primeServerClient([{ data: { name: `<b>Acme</b>\tLabs\n\t Space ${'x'.repeat(100)}` } }], {
        user: {
          id: 'user-markup',
          email: 'owner@acme.dev',
          user_metadata: { name: '<a href="https://evil.example">Support</a>' },
        },
        rpc: INVITE_RPCS,
      });
    });

    describe('WHEN the invite is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest(WORKSPACE_INVITE_REQUEST));
      });

      test('THEN the names keep their characters for the escaping email template, with whitespace collapsed and the length capped', () => {
        expect(admin.inviteUserByEmail.mock.calls[0]?.[1].data).toMatchObject({
          workspaceName: `<b>Acme</b> Labs Space ${'x'.repeat(100)}`.slice(0, MAX_NAME_LENGTH),
          invitedByName: '<a href="https://evil.example">Support</a>',
        });
      });
    });
  });

  describe('GIVEN an inviter name with bidi controls and a workspace name cut inside an emoji', () => {
    beforeEach(() => {
      primeServerClient([{ data: { name: `${'x'.repeat(MAX_NAME_LENGTH - 1)}🚀 tail` } }], {
        user: {
          id: 'user-bidi',
          email: 'owner@acme.dev',
          user_metadata: { name: 'Support\u202Emoc.lapyap\u2066\u200F' },
        },
        rpc: INVITE_RPCS,
      });
    });

    describe('WHEN the invite is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest(WORKSPACE_INVITE_REQUEST));
      });

      test('THEN the bidi controls are dropped and the length cap keeps the emoji whole', () => {
        expect(admin.inviteUserByEmail.mock.calls[0]?.[1].data).toMatchObject({
          invitedByName: 'Supportmoc.lapyap',
          workspaceName: `${'x'.repeat(MAX_NAME_LENGTH - 1)}🚀`,
        });
      });
    });
  });

  describe('GIVEN a same-origin request with a mixed-case email', () => {
    let client: ReturnType<typeof primeServerClient>;

    beforeEach(() => {
      client = primeServerClient(WORKSPACE_NAME_LOOKUP, {
        user: { id: 'user-case', email: 'owner@acme.dev' },
        rpc: INVITE_RPCS,
      });
    });

    describe('WHEN the invite is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(
          inviteRequest(
            { ...WORKSPACE_INVITE_REQUEST, email: '  TeamMate@Acme.dev ' },
            { 'sec-fetch-site': 'same-origin' },
          ),
        );
      });

      test('THEN the invitation and the email use the normalized address', () => {
        expect(response.status).toBe(200);
        expect(client.rpc).toHaveBeenCalledWith(
          'create_workspace_invitation',
          expect.objectContaining({ p_email: 'teammate@acme.dev' }),
        );
        expect(admin.inviteUserByEmail.mock.calls[0]?.[0]).toBe('teammate@acme.dev');
      });
    });
  });

  describe('GIVEN an invitee that already has an account', () => {
    let client: ReturnType<typeof primeServerClient>;

    beforeEach(() => {
      client = primeServerClient(WORKSPACE_NAME_LOOKUP, {
        user: { ...INVITER, id: 'user-registered' },
        rpc: INVITE_RPCS,
      });
      admin.inviteUserByEmail.mockResolvedValue({
        data: null,
        error: { message: 'A user with this email address has already been registered', code: 'email_exists' },
      });
    });

    describe('WHEN the invite email is refused as already registered', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest(WORKSPACE_INVITE_REQUEST));
      });

      test('THEN the invitation still succeeds without a rollback', async () => {
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ ok: true });
        expect(client.rpc).not.toHaveBeenCalledWith('revoke_workspace_invitation', expect.anything());
        expect(admin.deleteAllowance).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a new invitation whose email fails with a message that mentions an existing registration', () => {
    let client: ReturnType<typeof primeServerClient>;

    beforeEach(() => {
      client = primeServerClient(WORKSPACE_NAME_LOOKUP, { user: { ...INVITER, id: 'user-hook' }, rpc: INVITE_RPCS });
      admin.inviteUserByEmail.mockResolvedValue({
        data: null,
        error: { message: 'Hook rejected the already registered domain', code: 'hook_timeout' },
      });
    });

    describe('WHEN the invite is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest(WORKSPACE_INVITE_REQUEST));
      });

      test('THEN only the error code decides and the failure is answered with a rollback', () => {
        expect(response.status).toBe(502);
        expect(client.rpc).toHaveBeenCalledWith('revoke_workspace_invitation', { p_invitation_id: 'invitation-1' });
      });
    });
  });

  describe('GIVEN a new invitation whose email fails', () => {
    let client: ReturnType<typeof primeServerClient>;

    beforeEach(() => {
      client = primeServerClient(WORKSPACE_NAME_LOOKUP, {
        user: { ...INVITER, id: 'user-email-fails' },
        rpc: INVITE_RPCS,
      });
      admin.inviteUserByEmail.mockResolvedValue({
        data: null,
        error: { message: 'Email rate limit exceeded', code: 'over_email_send_rate_limit' },
      });
    });

    describe('WHEN the invite is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest(WORKSPACE_INVITE_REQUEST));
      });

      test('THEN the invitation is rolled back and a generic failure keeps the provider code but not its message', async () => {
        expect(response.status).toBe(502);
        await expect(response.json()).resolves.toEqual({
          error: { message: 'Invitation email failed', code: 'over_email_send_rate_limit' },
        });
        expect(client.rpc).toHaveBeenCalledWith('revoke_workspace_invitation', { p_invitation_id: 'invitation-1' });
      });

      test('THEN the signup allowance granted for the invitee is withdrawn', () => {
        expect(admin.from).toHaveBeenCalledExactlyOnceWith('signup_allowances');
        expect(admin.deleteAllowance).toHaveBeenCalledExactlyOnceWith('email', 'teammate@acme.dev');
      });
    });
  });

  describe('GIVEN a new invitation whose email fails and whose signup allowance cannot be withdrawn', () => {
    const failure = { message: 'admin api unavailable', code: '08006' };

    beforeEach(() => {
      primeServerClient(WORKSPACE_NAME_LOOKUP, { user: { ...INVITER, id: 'user-withdraw-fails' }, rpc: INVITE_RPCS });
      admin.inviteUserByEmail.mockResolvedValue({
        data: null,
        error: { message: 'smtp unreachable', code: 'unexpected_failure' },
      });
      admin.deleteAllowance.mockResolvedValue({ data: null, error: failure });
    });

    describe('WHEN the invite is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest(WORKSPACE_INVITE_REQUEST));
      });

      test('THEN the failed withdrawal is reported quietly and the answer stays the failed email', async () => {
        expect(response.status).toBe(502);
        await expect(response.json()).resolves.toEqual({
          error: { message: 'Invitation email failed', code: 'unexpected_failure' },
        });
        expect(event.error).toHaveBeenCalledWith(failure, { toast: false, context: 'workspace.revokeSignupAllowance' });
      });
    });
  });

  describe('GIVEN a new invitation whose signup allowance cannot be granted', () => {
    const failure = { message: 'relation does not exist', code: '42P01' };
    let client: ReturnType<typeof primeServerClient>;

    beforeEach(() => {
      client = primeServerClient(WORKSPACE_NAME_LOOKUP, {
        user: { id: 'user-allowance', email: 'owner@acme.dev' },
        rpc: INVITE_RPCS,
      });
      admin.rpc.mockResolvedValue({ data: null, error: failure });
    });

    describe('WHEN the invite is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest(WORKSPACE_INVITE_REQUEST));
      });

      test('THEN no email is sent, the invitation is rolled back and the failure answers like a failed email', async () => {
        expect(response.status).toBe(502);
        await expect(response.json()).resolves.toEqual({
          error: { message: 'Invitation email failed', code: '42P01' },
        });
        expect(admin.inviteUserByEmail).not.toHaveBeenCalled();
        expect(client.rpc).toHaveBeenCalledWith('revoke_workspace_invitation', { p_invitation_id: 'invitation-1' });
        expect(event.error).toHaveBeenCalledExactlyOnceWith(failure, {
          toast: false,
          context: 'workspace.grantSignupAllowance',
        });
      });
    });
  });

  describe('GIVEN a pending invitation that is sent again while the email fails', () => {
    let client: ReturnType<typeof primeServerClient>;

    beforeEach(() => {
      client = primeServerClient(WORKSPACE_NAME_LOOKUP, {
        user: { id: 'user-resend', email: 'owner@acme.dev' },
        rpc: {
          ...INVITE_RPCS,
          get_workspace_invitations: { data: [{ id: 'invitation-1', email: 'teammate@acme.dev' }] },
        },
      });
      admin.inviteUserByEmail.mockResolvedValue({ data: null, error: { message: 'Email rate limit exceeded' } });
    });

    describe('WHEN the invite is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest(WORKSPACE_INVITE_REQUEST));
      });

      test('THEN the failure surfaces and the invitation that existed before stays pending', () => {
        expect(response.status).toBe(502);
        expect(client.rpc).not.toHaveBeenCalledWith('revoke_workspace_invitation', expect.anything());
        expect(event.error).toHaveBeenCalledExactlyOnceWith(
          { message: 'Email rate limit exceeded' },
          { toast: false, context: 'workspace.sendInviteEmail' },
        );
      });
    });
  });

  describe('GIVEN a new invitation whose email fails and whose rollback fails', () => {
    beforeEach(() => {
      primeServerClient(WORKSPACE_NAME_LOOKUP, {
        user: { ...INVITER, id: 'user-rollback-fails' },
        rpc: { ...INVITE_RPCS, revoke_workspace_invitation: { error: { message: 'revoke failed' } } },
      });
      admin.inviteUserByEmail.mockResolvedValue({ data: null, error: { message: 'smtp unreachable' } });
    });

    describe('WHEN the invite is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(inviteRequest(WORKSPACE_INVITE_REQUEST));
      });

      test('THEN both failures are reported and the response stays a bad gateway', () => {
        expect(response.status).toBe(502);
        expect(vi.mocked(event.error).mock.calls).toEqual([
          [{ message: 'smtp unreachable' }, { toast: false, context: 'workspace.sendInviteEmail' }],
          [{ message: 'revoke failed' }, { toast: false, context: 'workspace.rollbackInvitation' }],
        ]);
      });
    });
  });

  describe('GIVEN an inviter who exhausted the invitation rate limit', () => {
    beforeEach(async () => {
      primeServerClient(WORKSPACE_NAME_LOOKUP, {
        user: { id: 'user-flood', email: 'owner@acme.dev' },
        rpc: INVITE_RPCS,
      });
      await Promise.all(
        Array.from({ length: WORKSPACE_INVITE_RATE_LIMIT_MAX_ATTEMPTS }, (_, index) =>
          handleWorkspaceInvite(inviteRequest({ ...WORKSPACE_INVITE_REQUEST, email: `guest${index}@acme.dev` })),
        ),
      );
      admin.inviteUserByEmail.mockClear();
    });

    describe('WHEN another invite is submitted', () => {
      beforeEach(async () => {
        response = await handleWorkspaceInvite(
          inviteRequest({ ...WORKSPACE_INVITE_REQUEST, email: 'one-more@acme.dev' }),
        );
      });

      test('THEN the request is throttled and no email is sent', () => {
        expect(response.status).toBe(429);
        expect(admin.inviteUserByEmail).not.toHaveBeenCalled();
      });
    });
  });
});
