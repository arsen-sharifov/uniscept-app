import type { SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';

import type {
  IIntegrationAccount,
  IIntegrationResponse,
  IIntegrationThread,
  IIntegrationWorkspace,
} from '../../interfaces';
import {
  deleteAccounts,
  getUserClient,
  readNode,
  seedAccount,
  seedMember,
  seedNode,
  seedThread,
  seedWorkspace,
  uniqueLabel,
} from '../../utils';

let owner: IIntegrationAccount;
let editor: IIntegrationAccount;
let viewer: IIntegrationAccount;
let editorClient: SupabaseClient;
let viewerClient: SupabaseClient;
let workspace: IIntegrationWorkspace;
let thread: IIntegrationThread;
let nodeId: string;

beforeAll(async () => {
  [owner, editor, viewer] = await Promise.all([seedAccount('owner'), seedAccount('editor'), seedAccount('viewer')]);
  workspace = await seedWorkspace(owner.id, uniqueLabel('canvas-rpcs'));
  await Promise.all([seedMember(workspace.id, editor.id, 'member'), seedMember(workspace.id, viewer.id, 'viewer')]);
  thread = await seedThread(workspace.id, owner.id);
  [editorClient, viewerClient] = await Promise.all([getUserClient(editor), getUserClient(viewer)]);
});

afterAll(async () => {
  await deleteAccounts(viewer, editor, owner);
});

beforeEach(async () => {
  nodeId = await seedNode(thread.id, editor.id, { label: 'rpc target' });
});

describe('set_canvas_node_status', () => {
  describe('GIVEN a member holding canvas edit permission', () => {
    describe('WHEN they mark the node valid', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await editorClient.rpc('set_canvas_node_status', { p_node_id: nodeId, p_status: 'valid' });
      });

      test('THEN the status is persisted', async () => {
        expect(response.error).toBeNull();
        await expect(readNode(nodeId)).resolves.toMatchObject({ status: 'valid' });
      });
    });

    describe('WHEN they submit an unknown status', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await editorClient.rpc('set_canvas_node_status', { p_node_id: nodeId, p_status: 'perfect' });
      });

      test('THEN the status is rejected as invalid', async () => {
        expect(response.error?.code).toBe('22023');
        await expect(readNode(nodeId)).resolves.toMatchObject({ status: null });
      });
    });
  });

  describe('GIVEN a viewer without edit permission', () => {
    describe('WHEN they mark the node valid', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await viewerClient.rpc('set_canvas_node_status', { p_node_id: nodeId, p_status: 'valid' });
      });

      test('THEN the call is denied and the node stays unmarked', async () => {
        expect(response.error?.code).toBe('42501');
        await expect(readNode(nodeId)).resolves.toMatchObject({ status: null });
      });
    });
  });
});

describe('set_canvas_node_answer', () => {
  describe('GIVEN a member holding canvas edit permission', () => {
    describe('WHEN they mark the node as the answer', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await editorClient.rpc('set_canvas_node_answer', { p_node_id: nodeId, p_is_answer: true });
      });

      test('THEN the answer flag is persisted', async () => {
        expect(response.error).toBeNull();
        await expect(readNode(nodeId)).resolves.toMatchObject({ is_answer: true });
      });
    });

    describe('WHEN they mark the question node as the answer', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await editorClient.rpc('set_canvas_node_answer', {
          p_node_id: thread.questionNodeId,
          p_is_answer: true,
        });
      });

      test('THEN the answer type constraint rejects it', async () => {
        expect(response.error?.code).toBe('23514');
        await expect(readNode(thread.questionNodeId)).resolves.toMatchObject({ is_answer: false });
      });
    });
  });

  describe('GIVEN a viewer without edit permission', () => {
    describe('WHEN they mark the node as the answer', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await viewerClient.rpc('set_canvas_node_answer', { p_node_id: nodeId, p_is_answer: true });
      });

      test('THEN the call is denied', async () => {
        expect(response.error?.code).toBe('42501');
        await expect(readNode(nodeId)).resolves.toMatchObject({ is_answer: false });
      });
    });
  });
});

describe('update_canvas_node_positions', () => {
  describe('GIVEN a member holding canvas edit permission', () => {
    describe('WHEN they move the node', () => {
      let response: IIntegrationResponse<number>;

      beforeEach(async () => {
        response = await editorClient.rpc('update_canvas_node_positions', {
          updates: [{ id: nodeId, position_x: 640, position_y: 480 }],
        });
      });

      test('THEN one row moves to the new position', async () => {
        expect(response.error).toBeNull();
        expect(response.data).toBe(1);
        await expect(readNode(nodeId)).resolves.toMatchObject({ position_x: 640, position_y: 480 });
      });
    });
  });

  describe('GIVEN a viewer without edit permission', () => {
    describe('WHEN they move the node', () => {
      let response: IIntegrationResponse<number>;

      beforeEach(async () => {
        response = await viewerClient.rpc('update_canvas_node_positions', {
          updates: [{ id: nodeId, position_x: 999, position_y: 999 }],
        });
      });

      test('THEN no row moves', async () => {
        expect(response.error).toBeNull();
        expect(response.data).toBe(0);
        await expect(readNode(nodeId)).resolves.toMatchObject({ position_x: 0, position_y: 0 });
      });
    });
  });
});
