import type { SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';

import type { IIntegrationAccount, IIntegrationResponse, IIntegrationWorkspace } from '../../interfaces';
import { deleteAccounts, getUserClient, seedAccount, seedMember, seedWorkspace, uniqueLabel } from '../../utils';

let owner: IIntegrationAccount;
let member: IIntegrationAccount;
let outsider: IIntegrationAccount;
let memberClient: SupabaseClient;
let outsiderClient: SupabaseClient;
let workspace: IIntegrationWorkspace;

beforeAll(async () => {
  [owner, member, outsider] = await Promise.all([seedAccount('owner'), seedAccount('member'), seedAccount('outsider')]);
  workspace = await seedWorkspace(owner.id, uniqueLabel('workspace-reads'));
  await seedMember(workspace.id, member.id, 'member');
  [memberClient, outsiderClient] = await Promise.all([getUserClient(member), getUserClient(outsider)]);
});

afterAll(async () => {
  await deleteAccounts(outsider, member, owner);
});

describe('get_workspace_members', () => {
  describe('GIVEN a workspace member', () => {
    describe('WHEN they read the roster', () => {
      let response: IIntegrationResponse<{ user_id: string; role_key: string }[]>;

      beforeEach(async () => {
        response = await memberClient.rpc('get_workspace_members', { p_workspace_id: workspace.id });
      });

      test('THEN every membership is listed with its role', () => {
        expect(response.error).toBeNull();
        expect(response.data!.map((row) => [row.user_id, row.role_key]).sort()).toEqual(
          [
            [owner.id, 'owner'],
            [member.id, 'member'],
          ].sort(),
        );
      });
    });
  });

  describe('GIVEN a signed-in outsider', () => {
    describe('WHEN they read the roster', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await outsiderClient.rpc('get_workspace_members', { p_workspace_id: workspace.id });
      });

      test('THEN the call is denied for a non-member', () => {
        expect(response.error?.code).toBe('42501');
        expect(response.error?.message).toMatch(/Not a member/);
      });
    });
  });
});

describe('get_workspace_roles', () => {
  describe('GIVEN a workspace member', () => {
    describe('WHEN they read the roles', () => {
      let response: IIntegrationResponse<{ key: string | null }[]>;

      beforeEach(async () => {
        response = await memberClient.rpc('get_workspace_roles', { p_workspace_id: workspace.id });
      });

      test('THEN the three system roles are listed', () => {
        expect(response.error).toBeNull();
        expect(response.data!.map((row) => row.key)).toEqual(['owner', 'member', 'viewer']);
      });
    });
  });

  describe('GIVEN a signed-in outsider', () => {
    describe('WHEN they read the roles', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await outsiderClient.rpc('get_workspace_roles', { p_workspace_id: workspace.id });
      });

      test('THEN the call is denied for a non-member', () => {
        expect(response.error?.code).toBe('42501');
      });
    });
  });
});

describe('get_my_workspace_permissions', () => {
  describe('GIVEN a workspace member', () => {
    describe('WHEN they read their own permissions', () => {
      let response: IIntegrationResponse<{ can_edit_canvas: boolean }[]>;

      beforeEach(async () => {
        response = await memberClient.rpc('get_my_workspace_permissions', { p_workspace_id: workspace.id });
      });

      test('THEN the member flags are returned', () => {
        expect(response.error).toBeNull();
        expect(response.data![0]).toMatchObject({
          is_owner: false,
          can_edit_canvas: true,
          can_comment: true,
          can_manage_structure: true,
          can_manage_members: false,
          can_manage_roles: false,
          can_manage_workspace: false,
        });
      });
    });
  });

  describe('GIVEN a signed-in outsider', () => {
    describe('WHEN they read their permissions for the workspace', () => {
      let response: IIntegrationResponse<unknown[]>;

      beforeEach(async () => {
        response = await outsiderClient.rpc('get_my_workspace_permissions', { p_workspace_id: workspace.id });
      });

      test('THEN no rows come back instead of an error', () => {
        expect(response.error).toBeNull();
        expect(response.data).toEqual([]);
      });
    });
  });
});

describe('get_my_workspaces', () => {
  describe('GIVEN a workspace member', () => {
    describe('WHEN they list their workspaces', () => {
      let response: IIntegrationResponse<{ id: string }[]>;

      beforeEach(async () => {
        response = await memberClient.rpc('get_my_workspaces');
      });

      test('THEN the joined workspace is listed', () => {
        expect(response.error).toBeNull();
        expect(response.data!.map((row) => row.id)).toContain(workspace.id);
      });
    });
  });

  describe('GIVEN a signed-in outsider', () => {
    describe('WHEN they list their workspaces', () => {
      let response: IIntegrationResponse<{ id: string }[]>;

      beforeEach(async () => {
        response = await outsiderClient.rpc('get_my_workspaces');
      });

      test('THEN the foreign workspace stays invisible', () => {
        expect(response.error).toBeNull();
        expect(response.data!.map((row) => row.id)).not.toContain(workspace.id);
      });
    });
  });
});
