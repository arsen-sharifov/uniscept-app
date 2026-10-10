import type { SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';

import { DAY_MS, ICON_LENGTH_CAP, MISSING_ROW_ID, ROLE_NAME_LENGTH_CAP } from '../../consts';
import type { IIntegrationAccount, IIntegrationResponse, IIntegrationWorkspace } from '../../interfaces';
import {
  deleteAccounts,
  getRoleId,
  getUserClient,
  isMember,
  readInvitation,
  readMemberRole,
  readRoleHolders,
  readWorkspace,
  readWorkspaceRole,
  removeMember,
  rolePermissionParams,
  seedAccount,
  seedInvitation,
  seedMember,
  seedMemberWithRole,
  seedRole,
  seedWorkspace,
  setMemberRole,
  uniqueEmail,
  uniqueLabel,
} from '../../utils';

let owner: IIntegrationAccount;
let manager: IIntegrationAccount;
let member: IIntegrationAccount;
let removable: IIntegrationAccount;
let rolesSteward: IIntegrationAccount;
let ownerClient: SupabaseClient;
let managerClient: SupabaseClient;
let memberClient: SupabaseClient;
let rolesStewardClient: SupabaseClient;
let workspace: IIntegrationWorkspace;
let memberRoleId: string;
let foreignRoleId: string;

beforeAll(async () => {
  [owner, manager, member, removable, rolesSteward] = await Promise.all([
    seedAccount('owner'),
    seedAccount('manager'),
    seedAccount('member'),
    seedAccount('removable'),
    seedAccount('roles-steward'),
  ]);
  workspace = await seedWorkspace(owner.id, uniqueLabel('role-management'));
  const foreignWorkspace = await seedWorkspace(owner.id, uniqueLabel('role-management-foreign'));
  foreignRoleId = await seedRole(foreignWorkspace.id, 'Foreign', { canComment: true });
  const managerRoleId = await seedRole(workspace.id, 'People manager', {
    canEditCanvas: true,
    canComment: true,
    canManageStructure: true,
    canManageMembers: true,
    canManageRoles: true,
  });
  const rolesStewardRoleId = await seedRole(workspace.id, 'Roles steward', {
    canManageMembers: true,
    canManageRoles: true,
  });
  memberRoleId = await getRoleId(workspace.id, 'member');
  await Promise.all([
    seedMemberWithRole(workspace.id, manager.id, managerRoleId),
    seedMemberWithRole(workspace.id, member.id, memberRoleId),
    seedMemberWithRole(workspace.id, rolesSteward.id, rolesStewardRoleId),
  ]);
  [ownerClient, managerClient, memberClient, rolesStewardClient] = await Promise.all([
    getUserClient(owner),
    getUserClient(manager),
    getUserClient(member),
    getUserClient(rolesSteward),
  ]);
});

afterAll(async () => {
  await deleteAccounts(rolesSteward, removable, member, manager, owner);
});

describe('create_workspace_role', () => {
  describe('GIVEN a member without role management permission', () => {
    beforeEach(async () => {
      await setMemberRole(workspace.id, member.id, memberRoleId);
    });

    describe('WHEN they create a role', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await memberClient.rpc('create_workspace_role', {
          p_workspace_id: workspace.id,
          p_name: uniqueLabel('Sneaky role'),
          p_icon: null,
          ...rolePermissionParams({ canComment: true }),
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
          ...rolePermissionParams({ canComment: true }),
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
          ...rolePermissionParams({ canManageWorkspace: true }),
        });
      });

      test('THEN the grant ceiling rejects the escalation', () => {
        expect(response.error?.code).toBe('42501');
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
          ...rolePermissionParams({
            canEditCanvas: true,
            canComment: true,
            canManageStructure: true,
            canManageMembers: true,
            canManageRoles: true,
            canManageWorkspace: true,
          }),
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
          ...rolePermissionParams({}),
        });
      });

      test('THEN the name is rejected as invalid', () => {
        expect(response.error?.code).toBe('22023');
      });
    });

    describe('WHEN they create a role with a name past the role name limit', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await ownerClient.rpc('create_workspace_role', {
          p_workspace_id: workspace.id,
          p_name: 'r'.repeat(ROLE_NAME_LENGTH_CAP + 1),
          p_icon: null,
          ...rolePermissionParams({}),
        });
      });

      test('THEN the name is rejected as too long', () => {
        expect(response.error?.code).toBe('22023');
      });
    });

    describe('WHEN they create a role with an icon at the database length cap', () => {
      let response: IIntegrationResponse<string>;

      beforeEach(async () => {
        response = await ownerClient.rpc('create_workspace_role', {
          p_workspace_id: workspace.id,
          p_name: uniqueLabel('Iconic'),
          p_icon: 'i'.repeat(ICON_LENGTH_CAP),
          ...rolePermissionParams({}),
        });
      });

      test('THEN the role is stored with its icon', async () => {
        expect(response.error).toBeNull();
        await expect(readWorkspaceRole(response.data!, 'icon')).resolves.toEqual({ icon: 'i'.repeat(ICON_LENGTH_CAP) });
      });
    });

    describe('WHEN they create a role with an icon past the database length cap', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await ownerClient.rpc('create_workspace_role', {
          p_workspace_id: workspace.id,
          p_name: uniqueLabel('Overdrawn'),
          p_icon: 'i'.repeat(ICON_LENGTH_CAP + 1),
          ...rolePermissionParams({}),
        });
      });

      test('THEN the check constraint rejects it', () => {
        expect(response.error?.code).toBe('23514');
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

  describe('GIVEN a powerful role of another workspace the manager owns', () => {
    let ownedRoleId: string;

    beforeEach(async () => {
      await setMemberRole(workspace.id, member.id, memberRoleId);
      const ownedWorkspace = await seedWorkspace(manager.id, uniqueLabel('role-management-owned'));
      ownedRoleId = await seedRole(ownedWorkspace.id, 'Owned steward', { canManageWorkspace: true });
    });

    describe('WHEN the manager assigns it to a member of this workspace', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient.rpc('set_member_role', {
          p_workspace_id: workspace.id,
          p_user_id: member.id,
          p_role_id: ownedRoleId,
        });
      });

      test('THEN the role is not found in this workspace and the membership is unchanged', async () => {
        expect(response.error?.code).toBe('P0002');
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

  describe('GIVEN a plain member and a comment-only role within the manager ceiling', () => {
    let commenterRoleId: string;

    beforeEach(async () => {
      await setMemberRole(workspace.id, member.id, memberRoleId);
      commenterRoleId = await seedRole(workspace.id, uniqueLabel('Commenter'), { canComment: true });
    });

    describe('WHEN the manager assigns the comment-only role to the member', () => {
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

  describe('GIVEN a plain member and another member holding the same role', () => {
    beforeEach(async () => {
      await setMemberRole(workspace.id, member.id, memberRoleId);
      await removeMember(workspace.id, removable.id);
      await seedMemberWithRole(workspace.id, removable.id, memberRoleId);
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

    describe("WHEN they change the other member's role through the rpc", () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        const viewerRoleId = await getRoleId(workspace.id, 'viewer');
        response = await memberClient.rpc('set_member_role', {
          p_workspace_id: workspace.id,
          p_user_id: removable.id,
          p_role_id: viewerRoleId,
        });
      });

      test('THEN the call is denied and the other member keeps their role', async () => {
        expect(response.error?.code).toBe('42501');
        await expect(readMemberRole(workspace.id, removable.id)).resolves.toBe(memberRoleId);
      });
    });
  });

  describe('GIVEN a member holding a role above the manager ceiling', () => {
    let stewardRoleId: string;

    beforeEach(async () => {
      stewardRoleId = await seedRole(workspace.id, uniqueLabel('Steward'), { canManageWorkspace: true });
      await setMemberRole(workspace.id, member.id, stewardRoleId);
    });

    describe('WHEN the manager demotes them to a role within the ceiling', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient.rpc('set_member_role', {
          p_workspace_id: workspace.id,
          p_user_id: member.id,
          p_role_id: memberRoleId,
        });
      });

      test('THEN the demotion is denied and the stronger role stays', async () => {
        expect(response.error?.code).toBe('42501');
        await expect(readMemberRole(workspace.id, member.id)).resolves.toBe(stewardRoleId);
      });
    });

    describe('WHEN the owner demotes them', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await ownerClient.rpc('set_member_role', {
          p_workspace_id: workspace.id,
          p_user_id: member.id,
          p_role_id: memberRoleId,
        });
      });

      test('THEN the owner bypasses the ceiling', async () => {
        expect(response.error).toBeNull();
        await expect(readMemberRole(workspace.id, member.id)).resolves.toBe(memberRoleId);
      });
    });
  });
});

describe('remove_workspace_member', () => {
  describe('GIVEN a member holding a role above the manager ceiling', () => {
    beforeEach(async () => {
      const stewardRoleId = await seedRole(workspace.id, uniqueLabel('Steward'), { canManageWorkspace: true });
      await removeMember(workspace.id, removable.id);
      await seedMemberWithRole(workspace.id, removable.id, stewardRoleId);
    });

    describe('WHEN the manager removes them', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient.rpc('remove_workspace_member', {
          p_workspace_id: workspace.id,
          p_user_id: removable.id,
        });
      });

      test('THEN the removal is denied and the membership stays', async () => {
        expect(response.error?.code).toBe('42501');
        await expect(isMember(workspace.id, removable.id)).resolves.toBe(true);
      });
    });

    describe('WHEN the owner removes them', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await ownerClient.rpc('remove_workspace_member', {
          p_workspace_id: workspace.id,
          p_user_id: removable.id,
        });
      });

      test('THEN the owner bypasses the ceiling and the membership is gone', async () => {
        expect(response.error).toBeNull();
        await expect(isMember(workspace.id, removable.id)).resolves.toBe(false);
      });
    });
  });

  describe('GIVEN a member holding a role within the manager ceiling and a plain member', () => {
    beforeEach(async () => {
      await setMemberRole(workspace.id, member.id, memberRoleId);
      await removeMember(workspace.id, removable.id);
      await seedMemberWithRole(workspace.id, removable.id, memberRoleId);
    });

    describe('WHEN the manager removes them', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient.rpc('remove_workspace_member', {
          p_workspace_id: workspace.id,
          p_user_id: removable.id,
        });
      });

      test('THEN the membership is gone', async () => {
        expect(response.error).toBeNull();
        await expect(isMember(workspace.id, removable.id)).resolves.toBe(false);
      });
    });

    describe('WHEN the plain member removes them', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await memberClient.rpc('remove_workspace_member', {
          p_workspace_id: workspace.id,
          p_user_id: removable.id,
        });
      });

      test('THEN the call is denied and the membership stays', async () => {
        expect(response.error?.code).toBe('42501');
        await expect(isMember(workspace.id, removable.id)).resolves.toBe(true);
      });
    });
  });

  describe('GIVEN the workspace owner as the target member', () => {
    describe('WHEN the manager removes them', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient.rpc('remove_workspace_member', {
          p_workspace_id: workspace.id,
          p_user_id: owner.id,
        });
      });

      test('THEN removing the owner is refused', async () => {
        expect(response.error?.code).toBe('22023');
        await expect(isMember(workspace.id, owner.id)).resolves.toBe(true);
      });
    });
  });
});

describe('workspace_members', () => {
  describe('GIVEN a people manager', () => {
    describe('WHEN they delete the owner membership directly', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient
          .from('workspace_members')
          .delete()
          .eq('workspace_id', workspace.id)
          .eq('user_id', owner.id);
      });

      test('THEN the table privilege is missing and the owner stays', async () => {
        expect(response.error?.code).toBe('42501');
        await expect(isMember(workspace.id, owner.id)).resolves.toBe(true);
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

      test('THEN the table privilege is missing', () => {
        expect(response.error?.code).toBe('42501');
        expect(response.error?.message).toMatch(/permission denied for table/);
      });
    });

    describe('WHEN they update a system role directly', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await memberClient
          .from('workspace_roles')
          .update({ can_manage_workspace: true })
          .eq('id', memberRoleId);
      });

      test('THEN the table privilege is missing and the role stays unchanged', async () => {
        expect(response.error?.code).toBe('42501');
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
          ...rolePermissionParams({ canEditCanvas: true, canComment: true, canManageStructure: true }),
        });
      });

      test('THEN built-in roles stay locked', () => {
        expect(response.error?.code).toBe('22023');
      });
    });
  });

  describe('GIVEN a custom role above the manager ceiling', () => {
    let stewardRoleId: string;

    beforeEach(async () => {
      stewardRoleId = await seedRole(workspace.id, uniqueLabel('Steward'), { canManageWorkspace: true });
    });

    describe('WHEN the manager strips its permissions', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient.rpc('update_workspace_role', {
          p_role_id: stewardRoleId,
          p_name: uniqueLabel('Stripped'),
          p_icon: null,
          ...rolePermissionParams({ canComment: true }),
        });
      });

      test('THEN the edit is denied and the role keeps its permissions', async () => {
        expect(response.error?.code).toBe('42501');
        await expect(readWorkspaceRole(stewardRoleId, 'can_manage_workspace')).resolves.toEqual({
          can_manage_workspace: true,
        });
      });
    });

    describe('WHEN the owner strips its permissions', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await ownerClient.rpc('update_workspace_role', {
          p_role_id: stewardRoleId,
          p_name: uniqueLabel('Stripped'),
          p_icon: null,
          ...rolePermissionParams({ canComment: true }),
        });
      });

      test('THEN the owner bypasses the ceiling', async () => {
        expect(response.error).toBeNull();
        await expect(readWorkspaceRole(stewardRoleId, 'can_manage_workspace, can_comment')).resolves.toEqual({
          can_manage_workspace: false,
          can_comment: true,
        });
      });
    });
  });

  describe('GIVEN a custom role within the manager ceiling and a plain member', () => {
    let commenterRoleId: string;

    beforeEach(async () => {
      commenterRoleId = await seedRole(workspace.id, uniqueLabel('Commenter'), { canComment: true });
      await setMemberRole(workspace.id, member.id, memberRoleId);
    });

    describe('WHEN the manager widens it within their own permissions', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient.rpc('update_workspace_role', {
          p_role_id: commenterRoleId,
          p_name: uniqueLabel('Editor'),
          p_icon: null,
          ...rolePermissionParams({ canEditCanvas: true, canComment: true }),
        });
      });

      test('THEN the role is updated', async () => {
        expect(response.error).toBeNull();
        await expect(readWorkspaceRole(commenterRoleId, 'can_edit_canvas')).resolves.toEqual({
          can_edit_canvas: true,
        });
      });
    });

    describe('WHEN the manager widens it past their own permissions', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient.rpc('update_workspace_role', {
          p_role_id: commenterRoleId,
          p_name: uniqueLabel('Shadow owner'),
          p_icon: null,
          ...rolePermissionParams({ canComment: true, canManageWorkspace: true }),
        });
      });

      test('THEN the grant ceiling rejects the escalation and the role stays', async () => {
        expect(response.error?.code).toBe('42501');
        await expect(readWorkspaceRole(commenterRoleId, 'can_manage_workspace')).resolves.toEqual({
          can_manage_workspace: false,
        });
      });
    });

    describe('WHEN a plain member edits it', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await memberClient.rpc('update_workspace_role', {
          p_role_id: commenterRoleId,
          p_name: uniqueLabel('Hijacked'),
          p_icon: null,
          ...rolePermissionParams({ canEditCanvas: true, canComment: true }),
        });
      });

      test('THEN the call is denied and the role stays', async () => {
        expect(response.error?.code).toBe('42501');
        await expect(readWorkspaceRole(commenterRoleId, 'can_edit_canvas')).resolves.toEqual({
          can_edit_canvas: false,
        });
      });
    });
  });

  describe('GIVEN a custom role of a workspace the manager does not belong to', () => {
    describe('WHEN the manager edits it', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient.rpc('update_workspace_role', {
          p_role_id: foreignRoleId,
          p_name: uniqueLabel('Hijacked'),
          p_icon: null,
          ...rolePermissionParams({ canEditCanvas: true, canComment: true }),
        });
      });

      test('THEN it is refused as not found, like a missing role, and the role stays', async () => {
        expect(response.error?.code).toBe('P0002');
        expect(response.error?.message).toBe('Role not found');
        await expect(readWorkspaceRole(foreignRoleId, 'can_edit_canvas')).resolves.toEqual({ can_edit_canvas: false });
      });
    });
  });

  describe('GIVEN a role id that does not exist', () => {
    describe('WHEN the manager edits it', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient.rpc('update_workspace_role', {
          p_role_id: MISSING_ROW_ID,
          p_name: uniqueLabel('Phantom'),
          p_icon: null,
          ...rolePermissionParams({ canComment: true }),
        });
      });

      test('THEN it is refused as not found', () => {
        expect(response.error?.code).toBe('P0002');
        expect(response.error?.message).toBe('Role not found');
      });
    });
  });
});

describe('delete_workspace_role', () => {
  describe('GIVEN a built-in system role', () => {
    describe('WHEN the owner deletes it', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await ownerClient.rpc('delete_workspace_role', { p_role_id: memberRoleId });
      });

      test('THEN built-in roles stay locked', () => {
        expect(response.error?.code).toBe('22023');
      });
    });
  });

  describe('GIVEN a custom role of a workspace the manager does not belong to', () => {
    describe('WHEN the manager deletes it', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient.rpc('delete_workspace_role', { p_role_id: foreignRoleId });
      });

      test('THEN it is refused as not found, like a missing role, and the role stays', async () => {
        expect(response.error?.code).toBe('P0002');
        expect(response.error?.message).toBe('Role not found');
        await expect(readWorkspaceRole(foreignRoleId, 'can_comment')).resolves.toEqual({ can_comment: true });
      });
    });
  });

  describe('GIVEN a role id that does not exist', () => {
    describe('WHEN the manager deletes it', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient.rpc('delete_workspace_role', { p_role_id: MISSING_ROW_ID });
      });

      test('THEN it is refused as not found', () => {
        expect(response.error?.code).toBe('P0002');
        expect(response.error?.message).toBe('Role not found');
      });
    });
  });

  describe('GIVEN a custom role above the manager ceiling held by a member', () => {
    let stewardRoleId: string;

    beforeEach(async () => {
      stewardRoleId = await seedRole(workspace.id, uniqueLabel('Steward'), { canManageWorkspace: true });
      await removeMember(workspace.id, removable.id);
      await seedMemberWithRole(workspace.id, removable.id, stewardRoleId);
    });

    describe('WHEN the manager deletes the role', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient.rpc('delete_workspace_role', { p_role_id: stewardRoleId });
      });

      test('THEN the deletion is denied and the holder keeps the role', async () => {
        expect(response.error?.code).toBe('42501');
        await expect(readMemberRole(workspace.id, removable.id)).resolves.toBe(stewardRoleId);
      });
    });

    describe('WHEN the owner deletes the role', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await ownerClient.rpc('delete_workspace_role', { p_role_id: stewardRoleId });
      });

      test('THEN the owner bypasses the ceiling and the holder falls back to the member role', async () => {
        expect(response.error).toBeNull();
        await expect(readMemberRole(workspace.id, removable.id)).resolves.toBe(memberRoleId);
        await expect(readWorkspaceRole(stewardRoleId, 'id')).resolves.toBeNull();
      });
    });
  });

  describe('GIVEN a custom role within the manager ceiling held by a member, and a plain member', () => {
    let commenterRoleId: string;

    beforeEach(async () => {
      commenterRoleId = await seedRole(workspace.id, uniqueLabel('Commenter'), { canComment: true });
      await setMemberRole(workspace.id, member.id, memberRoleId);
      await removeMember(workspace.id, removable.id);
      await seedMemberWithRole(workspace.id, removable.id, commenterRoleId);
    });

    describe('WHEN the manager deletes the role', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient.rpc('delete_workspace_role', { p_role_id: commenterRoleId });
      });

      test('THEN the role is gone and its holder falls back to the member role', async () => {
        expect(response.error).toBeNull();
        await expect(readWorkspaceRole(commenterRoleId, 'id')).resolves.toBeNull();
        await expect(readMemberRole(workspace.id, removable.id)).resolves.toBe(memberRoleId);
      });
    });

    describe('WHEN a plain member deletes the role', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await memberClient.rpc('delete_workspace_role', { p_role_id: commenterRoleId });
      });

      test('THEN the call is denied and the role stays', async () => {
        expect(response.error?.code).toBe('42501');
        await expect(readWorkspaceRole(commenterRoleId, 'id')).resolves.toEqual({ id: commenterRoleId });
      });
    });
  });

  describe('GIVEN an empty role held by a member and a steward lacking the member role permissions', () => {
    let emptyRoleId: string;

    beforeEach(async () => {
      emptyRoleId = await seedRole(workspace.id, uniqueLabel('Empty'), {});
      await removeMember(workspace.id, removable.id);
      await seedMemberWithRole(workspace.id, removable.id, emptyRoleId);
    });

    describe('WHEN the steward deletes the role to push the holder into the member role', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await rolesStewardClient.rpc('delete_workspace_role', { p_role_id: emptyRoleId });
      });

      test('THEN the deletion is denied and the holder keeps the empty role', async () => {
        expect(response.error?.code).toBe('42501');
        await expect(readMemberRole(workspace.id, removable.id)).resolves.toBe(emptyRoleId);
      });
    });
  });

  describe('GIVEN an empty role carried by a pending invitation', () => {
    let emptyRoleId: string;
    let invitationId: string;

    beforeEach(async () => {
      emptyRoleId = await seedRole(workspace.id, uniqueLabel('Empty'), {});
      invitationId = await seedInvitation(workspace.id, uniqueEmail('fallback'), emptyRoleId);
    });

    describe('WHEN the steward deletes the role', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await rolesStewardClient.rpc('delete_workspace_role', { p_role_id: emptyRoleId });
      });

      test('THEN the deletion is denied and the role stays', async () => {
        expect(response.error?.code).toBe('42501');
        await expect(readWorkspaceRole(emptyRoleId, 'id')).resolves.toEqual({ id: emptyRoleId });
      });
    });

    describe('WHEN the owner deletes the role', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await ownerClient.rpc('delete_workspace_role', { p_role_id: emptyRoleId });
      });

      test('THEN the pending invitation falls back to the member role', async () => {
        expect(response.error).toBeNull();
        await expect(readInvitation(invitationId)).resolves.toMatchObject({ status: 'pending', role_id: memberRoleId });
      });
    });
  });

  describe('GIVEN an empty role nobody holds', () => {
    let emptyRoleId: string;

    beforeEach(async () => {
      emptyRoleId = await seedRole(workspace.id, uniqueLabel('Unused'), {});
    });

    describe('WHEN the steward deletes the role', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await rolesStewardClient.rpc('delete_workspace_role', { p_role_id: emptyRoleId });
      });

      test('THEN the role is gone', async () => {
        expect(response.error).toBeNull();
        await expect(readWorkspaceRole(emptyRoleId, 'id')).resolves.toBeNull();
      });
    });
  });

  describe('GIVEN an empty role carried only by an expired invitation', () => {
    let emptyRoleId: string;

    beforeEach(async () => {
      emptyRoleId = await seedRole(workspace.id, uniqueLabel('Lapsed'), {});
      await seedInvitation(workspace.id, uniqueEmail('lapsed'), emptyRoleId, {
        expiresAt: new Date(Date.now() - DAY_MS),
      });
    });

    describe('WHEN the steward deletes the role', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await rolesStewardClient.rpc('delete_workspace_role', { p_role_id: emptyRoleId });
      });

      test('THEN the expired invitation does not hold the role back', async () => {
        expect(response.error).toBeNull();
        await expect(readWorkspaceRole(emptyRoleId, 'id')).resolves.toBeNull();
      });
    });
  });
});

describe('transfer_workspace_ownership', () => {
  let transferWorkspace: IIntegrationWorkspace;
  let transferOwnerRoleId: string;
  let transferMemberRoleId: string;

  beforeEach(async () => {
    transferWorkspace = await seedWorkspace(owner.id, uniqueLabel('transfer'));
    await seedMember(transferWorkspace.id, member.id, 'member');
    [transferOwnerRoleId, transferMemberRoleId] = await Promise.all([
      getRoleId(transferWorkspace.id, 'owner'),
      getRoleId(transferWorkspace.id, 'member'),
    ]);
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

      test('THEN only the owner may transfer ownership', async () => {
        expect(response.error?.code).toBe('42501');
        await expect(readWorkspace(transferWorkspace.id)).resolves.toMatchObject({ owner_id: owner.id });
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
        await expect(readMemberRole(transferWorkspace.id, member.id)).resolves.toBe(transferOwnerRoleId);
        await expect(readMemberRole(transferWorkspace.id, owner.id)).resolves.toBe(transferMemberRoleId);
        await expect(readWorkspace(transferWorkspace.id)).resolves.toMatchObject({ owner_id: member.id });
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
      });
    });

    describe('WHEN they transfer the ownership to an account outside the workspace', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await ownerClient.rpc('transfer_workspace_ownership', {
          p_workspace_id: transferWorkspace.id,
          p_new_owner_id: rolesSteward.id,
        });
      });

      test('THEN the transfer is refused and the owner keeps the workspace', async () => {
        expect(response.error?.code).toBe('P0002');
        await expect(readMemberRole(transferWorkspace.id, owner.id)).resolves.toBe(transferOwnerRoleId);
        await expect(readWorkspace(transferWorkspace.id)).resolves.toMatchObject({ owner_id: owner.id });
      });
    });
  });

  describe('GIVEN the workspace owner and two members', () => {
    beforeEach(async () => {
      await seedMember(transferWorkspace.id, removable.id, 'member');
    });

    describe('WHEN the owner transfers the ownership to both members at once', () => {
      let responses: IIntegrationResponse[];

      beforeEach(async () => {
        responses = await Promise.all([
          ownerClient.rpc('transfer_workspace_ownership', {
            p_workspace_id: transferWorkspace.id,
            p_new_owner_id: member.id,
          }),
          ownerClient.rpc('transfer_workspace_ownership', {
            p_workspace_id: transferWorkspace.id,
            p_new_owner_id: removable.id,
          }),
        ]);
      });

      test('THEN one transfer wins and exactly one member holds the owner role', async () => {
        expect(responses.filter((response) => response.error === null)).toHaveLength(1);
        await expect(readRoleHolders(transferWorkspace.id, transferOwnerRoleId)).resolves.toHaveLength(1);
      });
    });
  });

  describe('GIVEN a member the owner hands the workspace to and a manager who can manage that member', () => {
    let viewerRoleId: string;

    beforeEach(async () => {
      const transferManagerRoleId = await seedRole(transferWorkspace.id, 'People manager', {
        canEditCanvas: true,
        canComment: true,
        canManageStructure: true,
        canManageMembers: true,
      });
      await seedMemberWithRole(transferWorkspace.id, manager.id, transferManagerRoleId);
      viewerRoleId = await getRoleId(transferWorkspace.id, 'viewer');
    });

    describe('WHEN the owner transfers the ownership while the manager demotes the member', () => {
      beforeEach(async () => {
        await Promise.all([
          ownerClient.rpc('transfer_workspace_ownership', {
            p_workspace_id: transferWorkspace.id,
            p_new_owner_id: member.id,
          }),
          managerClient.rpc('set_member_role', {
            p_workspace_id: transferWorkspace.id,
            p_user_id: member.id,
            p_role_id: viewerRoleId,
          }),
        ]);
      });

      test('THEN exactly one member holds the owner role', async () => {
        await expect(readRoleHolders(transferWorkspace.id, transferOwnerRoleId)).resolves.toHaveLength(1);
      });
    });

    describe('WHEN the owner transfers the ownership while the manager removes the member', () => {
      beforeEach(async () => {
        await Promise.all([
          ownerClient.rpc('transfer_workspace_ownership', {
            p_workspace_id: transferWorkspace.id,
            p_new_owner_id: member.id,
          }),
          managerClient.rpc('remove_workspace_member', {
            p_workspace_id: transferWorkspace.id,
            p_user_id: member.id,
          }),
        ]);
      });

      test('THEN exactly one member holds the owner role', async () => {
        await expect(readRoleHolders(transferWorkspace.id, transferOwnerRoleId)).resolves.toHaveLength(1);
      });
    });
  });
});
