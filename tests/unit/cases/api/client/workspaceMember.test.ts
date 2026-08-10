import { describe, expect, test, vi } from 'vitest';

import { getWorkspaceMembers, removeWorkspaceMember, setMemberRole, transferWorkspaceOwnership } from '@api/client';
import { workspaceMemberRow } from '@mocks/rows';
import { primeSupabase } from '@mocks/supabase';

vi.mock('@/lib/supabase', () => import('@mocks/supabase'));

describe('getWorkspaceMembers', () => {
  describe('GIVEN stored members for the workspace', () => {
    describe('WHEN the members are fetched', () => {
      test('THEN the rows map through the member mapper', async () => {
        const { client } = primeSupabase([]);
        vi.mocked(client.rpc).mockResolvedValue({ data: [workspaceMemberRow()], error: null });

        await expect(getWorkspaceMembers('ws-1')).resolves.toEqual([
          {
            userId: 'user-1',
            roleId: 'role-1',
            roleKey: 'member',
            roleName: 'Member',
            isOwner: false,
            name: 'Arsen',
            email: 'user@example.com',
            avatarIcon: 'cat',
            joinedAt: '2026-01-01T00:00:00Z',
          },
        ]);
      });
    });
  });

  describe('GIVEN no stored members', () => {
    describe('WHEN the members are fetched', () => {
      test('THEN an empty list is returned', async () => {
        const { client } = primeSupabase([]);
        vi.mocked(client.rpc).mockResolvedValue({ data: null, error: null });

        await expect(getWorkspaceMembers('ws-1')).resolves.toEqual([]);
      });
    });
  });

  describe('GIVEN a failing rpc', () => {
    describe('WHEN the members are fetched', () => {
      test('THEN the error propagates', async () => {
        const { client } = primeSupabase([]);
        vi.mocked(client.rpc).mockResolvedValue({ data: null, error: new Error('db down') });

        await expect(getWorkspaceMembers('ws-1')).rejects.toThrow('db down');
      });
    });
  });
});

describe('setMemberRole', () => {
  describe('GIVEN a member and a target role', () => {
    describe('WHEN the member role is set', () => {
      test('THEN the rpc receives the workspace, user and role ids', async () => {
        const { client } = primeSupabase([]);
        vi.mocked(client.rpc).mockResolvedValue({ data: null, error: null });

        await setMemberRole('ws-1', 'user-1', 'role-1');

        expect(client.rpc).toHaveBeenCalledExactlyOnceWith('set_member_role', {
          p_workspace_id: 'ws-1',
          p_user_id: 'user-1',
          p_role_id: 'role-1',
        });
      });
    });
  });

  describe('GIVEN a failing rpc', () => {
    describe('WHEN the member role is set', () => {
      test('THEN the error propagates', async () => {
        const { client } = primeSupabase([]);
        vi.mocked(client.rpc).mockResolvedValue({ data: null, error: new Error('db down') });

        await expect(setMemberRole('ws-1', 'user-1', 'role-1')).rejects.toThrow('db down');
      });
    });
  });
});

describe('removeWorkspaceMember', () => {
  describe('GIVEN an existing member', () => {
    describe('WHEN the member is removed', () => {
      test('THEN the rpc receives the workspace and user ids', async () => {
        const { client } = primeSupabase([]);
        vi.mocked(client.rpc).mockResolvedValue({ data: null, error: null });

        await removeWorkspaceMember('ws-1', 'user-1');

        expect(client.rpc).toHaveBeenCalledExactlyOnceWith('remove_workspace_member', {
          p_workspace_id: 'ws-1',
          p_user_id: 'user-1',
        });
      });
    });
  });

  describe('GIVEN a failing rpc', () => {
    describe('WHEN the member is removed', () => {
      test('THEN the error propagates', async () => {
        const { client } = primeSupabase([]);
        vi.mocked(client.rpc).mockResolvedValue({ data: null, error: new Error('db down') });

        await expect(removeWorkspaceMember('ws-1', 'user-1')).rejects.toThrow('db down');
      });
    });
  });
});

describe('transferWorkspaceOwnership', () => {
  describe('GIVEN a new owner', () => {
    describe('WHEN the ownership is transferred', () => {
      test('THEN the rpc receives the workspace and new owner ids', async () => {
        const { client } = primeSupabase([]);
        vi.mocked(client.rpc).mockResolvedValue({ data: null, error: null });

        await transferWorkspaceOwnership('ws-1', 'user-2');

        expect(client.rpc).toHaveBeenCalledExactlyOnceWith('transfer_workspace_ownership', {
          p_workspace_id: 'ws-1',
          p_new_owner_id: 'user-2',
        });
      });
    });
  });

  describe('GIVEN a failing rpc', () => {
    describe('WHEN the ownership is transferred', () => {
      test('THEN the error propagates', async () => {
        const { client } = primeSupabase([]);
        vi.mocked(client.rpc).mockResolvedValue({ data: null, error: new Error('db down') });

        await expect(transferWorkspaceOwnership('ws-1', 'user-2')).rejects.toThrow('db down');
      });
    });
  });
});
