import type { SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';

import type { IIntegrationAccount, IIntegrationResponse, IIntegrationWorkspace } from '../../interfaces';
import {
  deleteAccounts,
  getRoleId,
  getUserClient,
  readMemberRole,
  readWorkspaceOwner,
  readWorkspaceRole,
  seedAccount,
  seedMember,
  seedMemberWithRole,
  seedRole,
  seedWorkspace,
  setMemberRole,
  uniqueLabel,
} from '../../utils';

let owner: IIntegrationAccount;
let manager: IIntegrationAccount;
let member: IIntegrationAccount;
let ownerClient: SupabaseClient;
let managerClient: SupabaseClient;
let memberClient: SupabaseClient;
let workspace: IIntegrationWorkspace;
let managerRoleId: string;
let memberRoleId: string;

beforeAll(async () => {
  [owner, manager, member] = await Promise.all([seedAccount('owner'), seedAccount('manager'), seedAccount('member')]);
  workspace = await seedWorkspace(owner.id, uniqueLabel('role-management'));
  managerRoleId = await seedRole(workspace.id, 'People manager', {
    canComment: true,
    canManageMembers: true,
    canManageRoles: true,
  });
  memberRoleId = await getRoleId(workspace.id, 'member');
  await Promise.all([
    seedMemberWithRole(workspace.id, manager.id, managerRoleId),
    seedMemberWithRole(workspace.id, member.id, memberRoleId),
  ]);
  [ownerClient, managerClient, memberClient] = await Promise.all([
    getUserClient(owner),
    getUserClient(manager),
    getUserClient(member),
  ]);
});

afterAll(async () => {
  await deleteAccounts(member, manager, owner);
});

describe('create_workspace_role', () => {
  describe('GIVEN a member without role management permission', () => {
    describe('WHEN they create a role', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await memberClient.rpc('create_workspace_role', {
          p_workspace_id: workspace.id,
          p_name: uniqueLabel('Sneaky role'),
          p_icon: null,
          p_can_edit_canvas: false,
          p_can_comment: true,
          p_can_manage_structure: false,
          p_can_manage_members: false,
          p_can_manage_roles: false,
          p_can_manage_workspace: false,
        });
      });

      test('THEN the call is denied', () => {
        expect(response.error?.code).toBe('42501');
      });
    });
  });

  describe('GIVEN a manager staying within their own permissions', () => {
    describe('WHEN they create a comment-only role', () => {
      let response: IIntegrationResponse<string>;

      beforeEach(async () => {
        response = await managerClient.rpc('create_workspace_role', {
          p_workspace_id: workspace.id,
          p_name: uniqueLabel('Commenter'),
          p_icon: null,
          p_can_edit_canvas: false,
          p_can_comment: true,
          p_can_manage_structure: false,
          p_can_manage_members: false,
          p_can_manage_roles: false,
          p_can_manage_workspace: false,
        });
      });

      test('THEN the role is created', async () => {
        expect(response.error).toBeNull();

        await expect(readWorkspaceRole(response.data!, 'is_system, can_comment')).resolves.toEqual({
          is_system: false,
          can_comment: true,
        });
      });
    });
  });

  describe('GIVEN a manager missing the workspace management permission', () => {
    describe('WHEN they create a role granting it', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient.rpc('create_workspace_role', {
          p_workspace_id: workspace.id,
          p_name: uniqueLabel('Shadow owner'),
          p_icon: null,
          p_can_edit_canvas: false,
          p_can_comment: false,
          p_can_manage_structure: false,
          p_can_manage_members: false,
          p_can_manage_roles: false,
          p_can_manage_workspace: true,
        });
      });

      test('THEN the grant ceiling rejects the escalation', () => {
        expect(response.error?.code).toBe('42501');
        expect(response.error?.message).toMatch(/permissions you do not have/);
      });
    });
  });

  describe('GIVEN the workspace owner', () => {
    describe('WHEN they create a role with every permission', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await ownerClient.rpc('create_workspace_role', {
          p_workspace_id: workspace.id,
          p_name: uniqueLabel('Deputy'),
          p_icon: null,
          p_can_edit_canvas: true,
          p_can_comment: true,
          p_can_manage_structure: true,
          p_can_manage_members: true,
          p_can_manage_roles: true,
          p_can_manage_workspace: true,
        });
      });

      test('THEN the owner bypasses the ceiling', () => {
        expect(response.error).toBeNull();
      });
    });

    describe('WHEN they create a role with a blank name', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await ownerClient.rpc('create_workspace_role', {
          p_workspace_id: workspace.id,
          p_name: '   ',
          p_icon: null,
          p_can_edit_canvas: false,
          p_can_comment: false,
          p_can_manage_structure: false,
          p_can_manage_members: false,
          p_can_manage_roles: false,
          p_can_manage_workspace: false,
        });
      });

      test('THEN the name is rejected as invalid', () => {
        expect(response.error?.code).toBe('22023');
      });
    });
  });
});

describe('set_member_role', () => {
  describe('GIVEN a role exceeding the manager ceiling', () => {
    let powerfulRoleId: string;

    beforeEach(async () => {
      await setMemberRole(workspace.id, member.id, memberRoleId);
      powerfulRoleId = await seedRole(workspace.id, uniqueLabel('Workspace admin'), {
        canManageWorkspace: true,
      });
    });

    describe('WHEN the manager assigns it to a member', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient.rpc('set_member_role', {
          p_workspace_id: workspace.id,
          p_user_id: member.id,
          p_role_id: powerfulRoleId,
        });
      });

      test('THEN the escalation is denied and the membership is unchanged', async () => {
        expect(response.error?.code).toBe('42501');
        await expect(readMemberRole(workspace.id, member.id)).resolves.toBe(memberRoleId);
      });
    });
  });

  describe('GIVEN the owner role as a target role', () => {
    describe('WHEN the manager assigns it to a member', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        const ownerRoleId = await getRoleId(workspace.id, 'owner');
        response = await managerClient.rpc('set_member_role', {
          p_workspace_id: workspace.id,
          p_user_id: member.id,
          p_role_id: ownerRoleId,
        });
      });

      test('THEN ownership assignment is refused', () => {
        expect(response.error?.code).toBe('22023');
        expect(response.error?.message).toMatch(/transferred/);
      });
    });
  });

  describe('GIVEN the workspace owner as a target member', () => {
    describe('WHEN the manager reassigns their role', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient.rpc('set_member_role', {
          p_workspace_id: workspace.id,
          p_user_id: owner.id,
          p_role_id: memberRoleId,
        });
      });

      test('THEN demoting the owner is refused', () => {
        expect(response.error?.code).toBe('22023');
      });
    });
  });

  describe('GIVEN a manager staying within the ceiling', () => {
    let commenterRoleId: string;

    beforeEach(async () => {
      commenterRoleId = await seedRole(workspace.id, uniqueLabel('Commenter'), { canComment: true });
    });

    describe('WHEN they assign the comment-only role to a member', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient.rpc('set_member_role', {
          p_workspace_id: workspace.id,
          p_user_id: member.id,
          p_role_id: commenterRoleId,
        });
      });

      test('THEN the membership role is updated', async () => {
        expect(response.error).toBeNull();
        await expect(readMemberRole(workspace.id, member.id)).resolves.toBe(commenterRoleId);
      });
    });
  });

  describe('GIVEN a plain member', () => {
    beforeEach(async () => {
      await setMemberRole(workspace.id, member.id, memberRoleId);
    });

    describe('WHEN they promote themselves through the members table', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        const ownerRoleId = await getRoleId(workspace.id, 'owner');
        response = await memberClient
          .from('workspace_members')
          .update({ role_id: ownerRoleId })
          .eq('workspace_id', workspace.id)
          .eq('user_id', member.id);
      });

      test('THEN the column privilege blocks the self-promotion', async () => {
        expect(response.error?.code).toBe('42501');
        await expect(readMemberRole(workspace.id, member.id)).resolves.toBe(memberRoleId);
      });
    });
  });
});

describe('workspace_roles', () => {
  describe('GIVEN an authenticated member', () => {
    describe('WHEN they insert a role directly', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await memberClient
          .from('workspace_roles')
          .insert({ workspace_id: workspace.id, name: uniqueLabel('Direct role') });
      });

      test('THEN the insert is denied by row level security', () => {
        expect(response.error?.code).toBe('42501');
      });
    });

    describe('WHEN they update a system role directly', () => {
      beforeEach(async () => {
        await memberClient.from('workspace_roles').update({ can_manage_workspace: true }).eq('id', memberRoleId);
      });

      test('THEN the role stays unchanged', async () => {
        await expect(readWorkspaceRole(memberRoleId, 'can_manage_workspace')).resolves.toEqual({
          can_manage_workspace: false,
        });
      });
    });
  });
});

describe('update_workspace_role', () => {
  describe('GIVEN a built-in system role', () => {
    describe('WHEN the owner renames it', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await ownerClient.rpc('update_workspace_role', {
          p_role_id: memberRoleId,
          p_name: 'Renamed member',
          p_icon: null,
          p_can_edit_canvas: true,
          p_can_comment: true,
          p_can_manage_structure: true,
          p_can_manage_members: false,
          p_can_manage_roles: false,
          p_can_manage_workspace: false,
        });
      });

      test('THEN built-in roles stay locked', () => {
        expect(response.error?.code).toBe('22023');
        expect(response.error?.message).toMatch(/cannot be edited/);
      });
    });
  });
});

describe('delete_workspace_role', () => {
  describe('GIVEN a custom role currently held by a member', () => {
    let customRoleId: string;

    beforeEach(async () => {
      customRoleId = await seedRole(workspace.id, uniqueLabel('Disposable'), { canComment: true });
      await setMemberRole(workspace.id, member.id, customRoleId);
    });

    describe('WHEN the owner deletes the role', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await ownerClient.rpc('delete_workspace_role', { p_role_id: customRoleId });
      });

      test('THEN the member falls back to the system member role', async () => {
        expect(response.error).toBeNull();
        await expect(readMemberRole(workspace.id, member.id)).resolves.toBe(memberRoleId);
      });
    });
  });

  describe('GIVEN a built-in system role', () => {
    describe('WHEN the owner deletes it', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await ownerClient.rpc('delete_workspace_role', { p_role_id: memberRoleId });
      });

      test('THEN built-in roles stay locked', () => {
        expect(response.error?.code).toBe('22023');
        expect(response.error?.message).toMatch(/cannot be deleted/);
      });
    });
  });
});

describe('transfer_workspace_ownership', () => {
  let transferWorkspace: IIntegrationWorkspace;

  beforeEach(async () => {
    transferWorkspace = await seedWorkspace(owner.id, uniqueLabel('transfer'));
    await seedMember(transferWorkspace.id, member.id, 'member');
  });

  describe('GIVEN a non-owner member', () => {
    describe('WHEN they transfer the ownership to themselves', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await memberClient.rpc('transfer_workspace_ownership', {
          p_workspace_id: transferWorkspace.id,
          p_new_owner_id: member.id,
        });
      });

      test('THEN only the owner may transfer ownership', () => {
        expect(response.error?.code).toBe('42501');
        expect(response.error?.message).toMatch(/Only the owner/);
      });
    });
  });

  describe('GIVEN the workspace owner', () => {
    describe('WHEN they transfer the ownership to a member', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await ownerClient.rpc('transfer_workspace_ownership', {
          p_workspace_id: transferWorkspace.id,
          p_new_owner_id: member.id,
        });
      });

      test('THEN the roles and the workspace owner column swap', async () => {
        expect(response.error).toBeNull();

        const ownerRoleId = await getRoleId(transferWorkspace.id, 'owner');
        const demotedRoleId = await getRoleId(transferWorkspace.id, 'member');

        await expect(readMemberRole(transferWorkspace.id, member.id)).resolves.toBe(ownerRoleId);
        await expect(readMemberRole(transferWorkspace.id, owner.id)).resolves.toBe(demotedRoleId);
        await expect(readWorkspaceOwner(transferWorkspace.id)).resolves.toBe(member.id);
      });
    });

    describe('WHEN they transfer the ownership to themselves', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await ownerClient.rpc('transfer_workspace_ownership', {
          p_workspace_id: transferWorkspace.id,
          p_new_owner_id: owner.id,
        });
      });

      test('THEN the transfer is rejected as redundant', () => {
        expect(response.error?.code).toBe('22023');
        expect(response.error?.message).toMatch(/Already the owner/);
      });
    });
  });
});
