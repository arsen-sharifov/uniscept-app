import type { SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';

import { INTEGRATION_ACCOUNT_DOMAIN } from '../../consts';
import type { IIntegrationAccount, IIntegrationResponse, IIntegrationWorkspace } from '../../interfaces';
import {
  deleteAccounts,
  deleteInvitations,
  getRoleId,
  getUserClient,
  isMember,
  readInvitation,
  removeMember,
  seedAccount,
  seedInvitation,
  seedMemberWithRole,
  seedRole,
  seedWorkspace,
  uniqueLabel,
} from '../../utils';

let owner: IIntegrationAccount;
let manager: IIntegrationAccount;
let member: IIntegrationAccount;
let invitee: IIntegrationAccount;
let managerClient: SupabaseClient;
let memberClient: SupabaseClient;
let inviteeClient: SupabaseClient;
let workspace: IIntegrationWorkspace;
let memberRoleId: string;

beforeAll(async () => {
  [owner, manager, member, invitee] = await Promise.all([
    seedAccount('owner'),
    seedAccount('manager'),
    seedAccount('member'),
    seedAccount('invitee'),
  ]);
  workspace = await seedWorkspace(owner.id, uniqueLabel('invitations'));
  memberRoleId = await getRoleId(workspace.id, 'member');
  const managerRoleId = await seedRole(workspace.id, 'People manager', { canManageMembers: true });
  await Promise.all([
    seedMemberWithRole(workspace.id, manager.id, managerRoleId),
    seedMemberWithRole(workspace.id, member.id, memberRoleId),
  ]);
  [managerClient, memberClient, inviteeClient] = await Promise.all([
    getUserClient(manager),
    getUserClient(member),
    getUserClient(invitee),
  ]);
});

afterAll(async () => {
  await deleteAccounts(invitee, member, manager, owner);
});

describe('workspace_invitations', () => {
  describe('GIVEN a pending invitation in the workspace', () => {
    beforeEach(async () => {
      await seedInvitation(workspace.id, `${uniqueLabel('pending')}@${INTEGRATION_ACCOUNT_DOMAIN}`, memberRoleId);
    });

    describe('WHEN a member selects the invitations table', () => {
      let response: IIntegrationResponse<unknown[]>;

      beforeEach(async () => {
        response = await memberClient.from('workspace_invitations').select('id').eq('workspace_id', workspace.id);
      });

      test('THEN no rows are visible without a select policy', () => {
        expect(response.error).toBeNull();
        expect(response.data).toEqual([]);
      });
    });

    describe('WHEN a member inserts an invitation directly', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await memberClient.from('workspace_invitations').insert({
          workspace_id: workspace.id,
          email: `direct@${INTEGRATION_ACCOUNT_DOMAIN}`,
          role_id: memberRoleId,
        });
      });

      test('THEN the insert is denied by row level security', () => {
        expect(response.error?.code).toBe('42501');
      });
    });
  });
});

describe('create_workspace_invitation', () => {
  describe('GIVEN a member without member management permission', () => {
    describe('WHEN they invite an email', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await memberClient.rpc('create_workspace_invitation', {
          p_workspace_id: workspace.id,
          p_email: `${uniqueLabel('nope')}@${INTEGRATION_ACCOUNT_DOMAIN}`,
          p_role_id: memberRoleId,
        });
      });

      test('THEN the call is denied', () => {
        expect(response.error?.code).toBe('42501');
      });
    });
  });

  describe('GIVEN a people manager', () => {
    describe('WHEN they invite a valid email', () => {
      let response: IIntegrationResponse<string>;

      beforeEach(async () => {
        response = await managerClient.rpc('create_workspace_invitation', {
          p_workspace_id: workspace.id,
          p_email: `${uniqueLabel('welcome')}@${INTEGRATION_ACCOUNT_DOMAIN}`,
          p_role_id: memberRoleId,
        });
      });

      test('THEN the invitation is stored as pending', async () => {
        expect(response.error).toBeNull();
        await expect(readInvitation(response.data!)).resolves.toEqual({ status: 'pending' });
      });
    });

    describe('WHEN they invite a malformed email', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient.rpc('create_workspace_invitation', {
          p_workspace_id: workspace.id,
          p_email: 'not-an-email',
          p_role_id: memberRoleId,
        });
      });

      test('THEN the email is rejected as invalid', () => {
        expect(response.error?.code).toBe('22023');
      });
    });

    describe('WHEN they invite someone into the owner role', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        const ownerRoleId = await getRoleId(workspace.id, 'owner');
        response = await managerClient.rpc('create_workspace_invitation', {
          p_workspace_id: workspace.id,
          p_email: `${uniqueLabel('usurper')}@${INTEGRATION_ACCOUNT_DOMAIN}`,
          p_role_id: ownerRoleId,
        });
      });

      test('THEN inviting as owner is refused', () => {
        expect(response.error?.code).toBe('22023');
        expect(response.error?.message).toMatch(/owner/);
      });
    });

    describe("WHEN they invite an existing member's email", () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient.rpc('create_workspace_invitation', {
          p_workspace_id: workspace.id,
          p_email: member.email,
          p_role_id: memberRoleId,
        });
      });

      test('THEN the duplicate membership is reported', () => {
        expect(response.error?.code).toBe('23505');
      });
    });
  });
});

describe('get_workspace_invitations', () => {
  describe('GIVEN a pending invitation', () => {
    beforeEach(async () => {
      await seedInvitation(workspace.id, `${uniqueLabel('listed')}@${INTEGRATION_ACCOUNT_DOMAIN}`, memberRoleId);
    });

    describe('WHEN the manager lists the invitations', () => {
      let response: IIntegrationResponse<{ email: string }[]>;

      beforeEach(async () => {
        response = await managerClient.rpc('get_workspace_invitations', { p_workspace_id: workspace.id });
      });

      test('THEN the pending invitations are returned', () => {
        expect(response.error).toBeNull();
        expect(response.data!.length).toBeGreaterThan(0);
      });
    });

    describe('WHEN a plain member lists the invitations', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await memberClient.rpc('get_workspace_invitations', { p_workspace_id: workspace.id });
      });

      test('THEN the call is denied', () => {
        expect(response.error?.code).toBe('42501');
      });
    });
  });
});

describe('accept_workspace_invitation', () => {
  describe('GIVEN an invitation addressed to another account', () => {
    let invitationId: string;

    beforeEach(async () => {
      invitationId = await seedInvitation(
        workspace.id,
        `${uniqueLabel('someone-else')}@${INTEGRATION_ACCOUNT_DOMAIN}`,
        memberRoleId,
      );
    });

    describe('WHEN the invitee accepts it', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await inviteeClient.rpc('accept_workspace_invitation', { p_invitation_id: invitationId });
      });

      test('THEN the acceptance is denied for a foreign email', () => {
        expect(response.error?.code).toBe('42501');
        expect(response.error?.message).toMatch(/different account/);
      });
    });
  });

  describe('GIVEN an invitation addressed to the caller', () => {
    let invitationId: string;

    beforeEach(async () => {
      await removeMember(workspace.id, invitee.id);
      await deleteInvitations(workspace.id, invitee.email);
      invitationId = await seedInvitation(workspace.id, invitee.email, memberRoleId);
    });

    describe('WHEN the invitee accepts it', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await inviteeClient.rpc('accept_workspace_invitation', { p_invitation_id: invitationId });
      });

      test('THEN the membership appears and the invitation is accepted', async () => {
        expect(response.error).toBeNull();
        await expect(isMember(workspace.id, invitee.id)).resolves.toBe(true);
        await expect(readInvitation(invitationId)).resolves.toEqual({ status: 'accepted' });
      });
    });

    describe('WHEN the invitee declines it', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await inviteeClient.rpc('decline_workspace_invitation', { p_invitation_id: invitationId });
      });

      test('THEN the invitation is declined and no membership appears', async () => {
        expect(response.error).toBeNull();
        await expect(readInvitation(invitationId)).resolves.toEqual({ status: 'declined' });
        await expect(isMember(workspace.id, invitee.id)).resolves.toBe(false);
      });
    });

    describe('WHEN the invitee lists their invitations', () => {
      let response: IIntegrationResponse<{ workspace_id: string }[]>;

      beforeEach(async () => {
        response = await inviteeClient.rpc('get_my_invitations');
      });

      test('THEN the pending invitation is listed with its workspace', () => {
        expect(response.error).toBeNull();
        expect(response.data!.map((row) => row.workspace_id)).toContain(workspace.id);
      });
    });
  });
});

describe('revoke_workspace_invitation', () => {
  describe('GIVEN a pending invitation', () => {
    let invitationId: string;

    beforeEach(async () => {
      invitationId = await seedInvitation(
        workspace.id,
        `${uniqueLabel('revoked')}@${INTEGRATION_ACCOUNT_DOMAIN}`,
        memberRoleId,
      );
    });

    describe('WHEN the manager revokes it', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await managerClient.rpc('revoke_workspace_invitation', { p_invitation_id: invitationId });
      });

      test('THEN the invitation row is gone', async () => {
        expect(response.error).toBeNull();
        await expect(readInvitation(invitationId)).resolves.toBeNull();
      });
    });

    describe('WHEN a plain member revokes it', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await memberClient.rpc('revoke_workspace_invitation', { p_invitation_id: invitationId });
      });

      test('THEN the call is denied', async () => {
        expect(response.error?.code).toBe('42501');
        await expect(readInvitation(invitationId)).resolves.toEqual({ status: 'pending' });
      });
    });
  });
});
