import type { SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';

import type {
  IIntegrationAccount,
  IIntegrationResponse,
  IIntegrationThread,
  IIntegrationWorkspace,
} from '../../interfaces';
import {
  createAnonClient,
  deleteAccounts,
  getUserClient,
  isMember,
  readCommentAuthorship,
  readNodeAuthorship,
  readWorkspace,
  removeMember,
  seedAccount,
  seedMember,
  seedNode,
  seedNodeComment,
  seedThread,
  seedWorkspace,
  uniqueLabel,
} from '../../utils';

let owner: IIntegrationAccount;
let leaver: IIntegrationAccount;
let successor: IIntegrationAccount;
let outsider: IIntegrationAccount;
let ownerClient: SupabaseClient;
let leaverClient: SupabaseClient;
let outsiderClient: SupabaseClient;
let anonClient: SupabaseClient;
let workspace: IIntegrationWorkspace;
let thread: IIntegrationThread;

beforeAll(async () => {
  [owner, leaver, successor, outsider] = await Promise.all([
    seedAccount('leaving-owner'),
    seedAccount('leaver'),
    seedAccount('successor'),
    seedAccount('leaving-outsider'),
  ]);
  workspace = await seedWorkspace(owner.id, uniqueLabel('leaving'));
  thread = await seedThread(workspace.id, owner.id);
  [ownerClient, leaverClient, outsiderClient] = await Promise.all([
    getUserClient(owner),
    getUserClient(leaver),
    getUserClient(outsider),
  ]);
  anonClient = createAnonClient();
});

afterAll(async () => {
  await deleteAccounts(outsider, successor, leaver, owner);
});

describe('leave_workspace', () => {
  describe('GIVEN a member who wrote a node and a comment', () => {
    let nodeId: string;
    let commentId: string;

    beforeEach(async () => {
      await removeMember(workspace.id, leaver.id);
      await seedMember(workspace.id, leaver.id, 'member');
      nodeId = await seedNode(thread.id, leaver.id, { label: 'Leaver claim' });
      commentId = await seedNodeComment(nodeId, leaver.id, 'Leaver remark');
    });

    describe('WHEN they leave the workspace', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await leaverClient.rpc('leave_workspace', { p_workspace_id: workspace.id });
      });

      test('THEN their membership is gone', async () => {
        expect(response.error).toBeNull();
        await expect(isMember(workspace.id, leaver.id)).resolves.toBe(false);
      });

      test('THEN their node and comment stay under their authorship', async () => {
        await expect(readNodeAuthorship(nodeId)).resolves.toMatchObject({
          label: 'Leaver claim',
          created_by: leaver.id,
        });
        await expect(readCommentAuthorship(commentId)).resolves.toMatchObject({
          text: 'Leaver remark',
          author_id: leaver.id,
        });
      });

      test('THEN the workspace drops out of their list and its threads are hidden from them', async () => {
        await expect(leaverClient.rpc('get_my_workspaces')).resolves.toMatchObject({
          error: null,
          data: expect.not.arrayContaining([expect.objectContaining({ id: workspace.id })]),
        });
        await expect(leaverClient.from('threads').select('id').eq('workspace_id', workspace.id)).resolves.toMatchObject(
          { error: null, data: [] },
        );
      });

      test('THEN the members list of the workspace no longer names them', async () => {
        await expect(ownerClient.rpc('get_workspace_members', { p_workspace_id: workspace.id })).resolves.toMatchObject(
          {
            error: null,
            data: expect.not.arrayContaining([expect.objectContaining({ user_id: leaver.id })]),
          },
        );
      });
    });

    describe('WHEN they leave the workspace a second time', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        await leaverClient.rpc('leave_workspace', { p_workspace_id: workspace.id });
        response = await leaverClient.rpc('leave_workspace', { p_workspace_id: workspace.id });
      });

      test('THEN the repeated call changes nothing and reports no error', async () => {
        expect(response.error).toBeNull();
        await expect(isMember(workspace.id, leaver.id)).resolves.toBe(false);
      });
    });
  });

  describe('GIVEN the workspace owner', () => {
    describe('WHEN they leave the workspace', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await ownerClient.rpc('leave_workspace', { p_workspace_id: workspace.id });
      });

      test('THEN leaving is refused and the ownership stays', async () => {
        expect(response.error?.code).toBe('22023');
        await expect(isMember(workspace.id, owner.id)).resolves.toBe(true);
        await expect(readWorkspace(workspace.id)).resolves.toMatchObject({ owner_id: owner.id });
      });
    });
  });

  describe('GIVEN an owner who transferred the ownership to a member', () => {
    let handedOver: IIntegrationWorkspace;

    beforeEach(async () => {
      handedOver = await seedWorkspace(owner.id, uniqueLabel('handed-over'));
      await seedMember(handedOver.id, successor.id, 'member');
      const { error } = await ownerClient.rpc('transfer_workspace_ownership', {
        p_workspace_id: handedOver.id,
        p_new_owner_id: successor.id,
      });

      if (error) throw new Error(`Could not transfer ${handedOver.id}: ${error.message}`);
    });

    describe('WHEN the former owner leaves the workspace', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await ownerClient.rpc('leave_workspace', { p_workspace_id: handedOver.id });
      });

      test('THEN they are gone and the new owner keeps the workspace', async () => {
        expect(response.error).toBeNull();
        await expect(isMember(handedOver.id, owner.id)).resolves.toBe(false);
        await expect(isMember(handedOver.id, successor.id)).resolves.toBe(true);
        await expect(readWorkspace(handedOver.id)).resolves.toMatchObject({ owner_id: successor.id });
      });
    });
  });

  describe('GIVEN an account outside the workspace', () => {
    describe('WHEN it leaves the workspace', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await outsiderClient.rpc('leave_workspace', { p_workspace_id: workspace.id });
      });

      test('THEN nothing changes and no error is reported', async () => {
        expect(response.error).toBeNull();
        await expect(isMember(workspace.id, owner.id)).resolves.toBe(true);
      });
    });
  });

  describe('GIVEN a visitor without a session', () => {
    describe('WHEN it leaves the workspace', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await anonClient.rpc('leave_workspace', { p_workspace_id: workspace.id });
      });

      test('THEN execution is denied', () => {
        expect(response.error?.code).toBe('42501');
        expect(response.error?.message).toMatch(/permission denied for function/);
      });
    });
  });
});
