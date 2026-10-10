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
  readEdge,
  readNode,
  seedAccount,
  seedEdge,
  seedMember,
  seedNode,
  seedNodeComment,
  seedThread,
  seedWorkspace,
  uniqueLabel,
} from '../../utils';

let owner: IIntegrationAccount;
let author: IIntegrationAccount;
let editor: IIntegrationAccount;
let viewer: IIntegrationAccount;
let outsider: IIntegrationAccount;
let ownerClient: SupabaseClient;
let authorClient: SupabaseClient;
let editorClient: SupabaseClient;
let viewerClient: SupabaseClient;
let outsiderClient: SupabaseClient;
let workspace: IIntegrationWorkspace;
let thread: IIntegrationThread;

beforeAll(async () => {
  [owner, author, editor, viewer, outsider] = await Promise.all([
    seedAccount('owner'),
    seedAccount('author'),
    seedAccount('editor'),
    seedAccount('viewer'),
    seedAccount('outsider'),
  ]);
  workspace = await seedWorkspace(owner.id, uniqueLabel('canvas-access'));
  await Promise.all([
    seedMember(workspace.id, author.id, 'member'),
    seedMember(workspace.id, editor.id, 'member'),
    seedMember(workspace.id, viewer.id, 'viewer'),
  ]);
  thread = await seedThread(workspace.id, owner.id);
  [ownerClient, authorClient, editorClient, viewerClient, outsiderClient] = await Promise.all([
    getUserClient(owner),
    getUserClient(author),
    getUserClient(editor),
    getUserClient(viewer),
    getUserClient(outsider),
  ]);
});

afterAll(async () => {
  await deleteAccounts(outsider, viewer, editor, author, owner);
});

describe('canvas_nodes', () => {
  describe('GIVEN a member holding canvas edit permission', () => {
    describe('WHEN they insert a canvas node', () => {
      let response: IIntegrationResponse<{ id: string }[]>;

      beforeEach(async () => {
        response = await editorClient
          .from('canvas_nodes')
          .insert({ thread_id: thread.id, type: 'canvas-node', label: 'by editor' })
          .select('id');
      });

      test('THEN the node is created without a policy recursion error', async () => {
        expect(response.error).toBeNull();
        await expect(readNode(response.data![0]!.id)).resolves.toMatchObject({ label: 'by editor' });
      });
    });
  });

  describe('GIVEN a viewer without edit permission', () => {
    describe('WHEN they insert a canvas node', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await viewerClient
          .from('canvas_nodes')
          .insert({ thread_id: thread.id, type: 'canvas-node', label: 'by viewer' });
      });

      test('THEN the insert is denied by row level security', () => {
        expect(response.error?.code).toBe('42501');
      });
    });

    describe('WHEN they read the thread nodes', () => {
      let response: IIntegrationResponse<{ id: string }[]>;

      beforeEach(async () => {
        response = await viewerClient.from('canvas_nodes').select('id').eq('thread_id', thread.id);
      });

      test('THEN the membership still grants read access', () => {
        expect(response.error).toBeNull();
        expect(response.data!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('GIVEN a signed-in outsider', () => {
    describe('WHEN they read the thread nodes', () => {
      let response: IIntegrationResponse<unknown[]>;

      beforeEach(async () => {
        response = await outsiderClient.from('canvas_nodes').select('id').eq('thread_id', thread.id);
      });

      test('THEN nothing comes back', () => {
        expect(response.error).toBeNull();
        expect(response.data).toEqual([]);
      });
    });
  });

  describe('GIVEN a node created by another member', () => {
    let nodeId: string;

    beforeEach(async () => {
      nodeId = await seedNode(thread.id, author.id, { label: 'original' });
    });

    describe('WHEN a non-author editor updates its label', () => {
      beforeEach(async () => {
        await editorClient.from('canvas_nodes').update({ label: 'hijacked' }).eq('id', nodeId);
      });

      test('THEN the row stays unchanged', async () => {
        await expect(readNode(nodeId)).resolves.toMatchObject({ label: 'original' });
      });
    });

    describe('WHEN its author updates the label', () => {
      beforeEach(async () => {
        await authorClient.from('canvas_nodes').update({ label: 'revised by author' }).eq('id', nodeId);
      });

      test('THEN the new label is persisted', async () => {
        await expect(readNode(nodeId)).resolves.toMatchObject({ label: 'revised by author' });
      });
    });

    describe('WHEN the workspace owner updates the label', () => {
      beforeEach(async () => {
        await ownerClient.from('canvas_nodes').update({ label: 'revised by owner' }).eq('id', nodeId);
      });

      test('THEN the new label is persisted', async () => {
        await expect(readNode(nodeId)).resolves.toMatchObject({ label: 'revised by owner' });
      });
    });

    describe('WHEN a non-author editor deletes it', () => {
      beforeEach(async () => {
        await editorClient.from('canvas_nodes').delete().eq('id', nodeId);
      });

      test('THEN the node survives', async () => {
        await expect(readNode(nodeId)).resolves.not.toBeNull();
      });
    });

    describe('WHEN its author deletes it', () => {
      beforeEach(async () => {
        await authorClient.from('canvas_nodes').delete().eq('id', nodeId);
      });

      test('THEN the node is gone', async () => {
        await expect(readNode(nodeId)).resolves.toBeNull();
      });
    });
  });

  describe('GIVEN a node authored by a viewer, who holds no edit permission', () => {
    let nodeId: string;

    beforeEach(async () => {
      nodeId = await seedNode(thread.id, viewer.id, { label: 'written before the demotion' });
    });

    describe('WHEN the viewer updates its label', () => {
      beforeEach(async () => {
        await viewerClient.from('canvas_nodes').update({ label: 'edited without permission' }).eq('id', nodeId);
      });

      test('THEN the row stays unchanged', async () => {
        await expect(readNode(nodeId)).resolves.toMatchObject({ label: 'written before the demotion' });
      });
    });

    describe('WHEN the viewer deletes it', () => {
      beforeEach(async () => {
        await viewerClient.from('canvas_nodes').delete().eq('id', nodeId);
      });

      test('THEN the node survives', async () => {
        await expect(readNode(nodeId)).resolves.not.toBeNull();
      });
    });
  });

  describe('GIVEN the question node of a thread', () => {
    describe('WHEN the workspace owner deletes it', () => {
      beforeEach(async () => {
        await ownerClient.from('canvas_nodes').delete().eq('id', thread.questionNodeId);
      });

      test('THEN the question node survives', async () => {
        await expect(readNode(thread.questionNodeId)).resolves.not.toBeNull();
      });
    });
  });
});

describe('canvas_edges', () => {
  describe('GIVEN two nodes in the same thread', () => {
    let sourceId: string;
    let targetId: string;

    beforeEach(async () => {
      [sourceId, targetId] = await Promise.all([
        seedNode(thread.id, editor.id, { label: 'edge source' }),
        seedNode(thread.id, editor.id, { label: 'edge target' }),
      ]);
    });

    describe('WHEN an editor connects them', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await editorClient.from('canvas_edges').insert({
          thread_id: thread.id,
          source_node_id: sourceId,
          target_node_id: targetId,
          source_handle: 'bottom',
          target_handle: 'top',
        });
      });

      test('THEN the edge is created', () => {
        expect(response.error).toBeNull();
      });
    });

    describe('WHEN a viewer connects them', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await viewerClient.from('canvas_edges').insert({
          thread_id: thread.id,
          source_node_id: sourceId,
          target_node_id: targetId,
          source_handle: 'bottom',
          target_handle: 'top',
        });
      });

      test('THEN the insert is denied by row level security', () => {
        expect(response.error?.code).toBe('42501');
      });
    });
  });

  describe('GIVEN nodes living in two different threads', () => {
    let sourceId: string;
    let foreignTargetId: string;

    beforeEach(async () => {
      const foreignThread = await seedThread(workspace.id, owner.id);
      sourceId = await seedNode(thread.id, editor.id, { label: 'local source' });
      foreignTargetId = await seedNode(foreignThread.id, editor.id, { label: 'foreign target' });
    });

    describe('WHEN an editor connects them across threads', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await editorClient.from('canvas_edges').insert({
          thread_id: thread.id,
          source_node_id: sourceId,
          target_node_id: foreignTargetId,
          source_handle: 'bottom',
          target_handle: 'top',
        });
      });

      test('THEN the insert is denied by row level security', () => {
        expect(response.error?.code).toBe('42501');
      });
    });
  });

  describe('GIVEN an edge drawn by an editor between two nodes of the thread', () => {
    let edgeId: string;

    beforeEach(async () => {
      const [sourceId, targetId] = await Promise.all([seedNode(thread.id, editor.id), seedNode(thread.id, editor.id)]);
      edgeId = await seedEdge(thread.id, sourceId, targetId, editor.id);
    });

    describe('WHEN a viewer reads the thread edges', () => {
      let response: IIntegrationResponse<{ id: string }[]>;

      beforeEach(async () => {
        response = await viewerClient.from('canvas_edges').select('id').eq('thread_id', thread.id);
      });

      test('THEN the membership grants read access', () => {
        expect(response.error).toBeNull();
        expect(response.data!.map((row) => row.id)).toContain(edgeId);
      });
    });

    describe('WHEN a signed-in outsider reads the thread edges', () => {
      let response: IIntegrationResponse<unknown[]>;

      beforeEach(async () => {
        response = await outsiderClient.from('canvas_edges').select('id').eq('thread_id', thread.id);
      });

      test('THEN nothing comes back', () => {
        expect(response.error).toBeNull();
        expect(response.data).toEqual([]);
      });
    });

    describe('WHEN a viewer deletes it', () => {
      beforeEach(async () => {
        await viewerClient.from('canvas_edges').delete().eq('id', edgeId);
      });

      test('THEN the edge survives', async () => {
        await expect(readEdge(edgeId)).resolves.not.toBeNull();
      });
    });

    describe('WHEN another editor deletes it', () => {
      beforeEach(async () => {
        await authorClient.from('canvas_edges').delete().eq('id', edgeId);
      });

      test('THEN the edge is gone', async () => {
        await expect(readEdge(edgeId)).resolves.toBeNull();
      });
    });
  });
});

describe('node_comments', () => {
  let nodeId: string;

  beforeEach(async () => {
    nodeId = await seedNode(thread.id, author.id, { label: 'commented node' });
  });

  describe('GIVEN a viewer without comment permission', () => {
    describe('WHEN they comment on a node', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await viewerClient
          .from('node_comments')
          .insert({ node_id: nodeId, author_id: viewer.id, text: 'viewer comment' });
      });

      test('THEN the insert is denied by row level security', () => {
        expect(response.error?.code).toBe('42501');
      });
    });
  });

  describe('GIVEN a member holding comment permission', () => {
    describe('WHEN they comment on a node', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await editorClient
          .from('node_comments')
          .insert({ node_id: nodeId, author_id: editor.id, text: 'editor comment' });
      });

      test('THEN the comment is stored', () => {
        expect(response.error).toBeNull();
      });
    });

    describe("WHEN they comment under someone else's identity", () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await editorClient
          .from('node_comments')
          .insert({ node_id: nodeId, author_id: author.id, text: 'forged comment' });
      });

      test('THEN the insert is denied by row level security', () => {
        expect(response.error?.code).toBe('42501');
      });
    });
  });

  describe('GIVEN a comment on the node', () => {
    let commentId: string;

    beforeEach(async () => {
      commentId = await seedNodeComment(nodeId, author.id, 'visible to members');
    });

    describe('WHEN a viewer reads the node comments', () => {
      let response: IIntegrationResponse<{ id: string }[]>;

      beforeEach(async () => {
        response = await viewerClient.from('node_comments').select('id').eq('node_id', nodeId);
      });

      test('THEN the membership grants read access', () => {
        expect(response.error).toBeNull();
        expect(response.data!.map((row) => row.id)).toContain(commentId);
      });
    });

    describe('WHEN a signed-in outsider reads the node comments', () => {
      let response: IIntegrationResponse<unknown[]>;

      beforeEach(async () => {
        response = await outsiderClient.from('node_comments').select('id').eq('node_id', nodeId);
      });

      test('THEN nothing comes back', () => {
        expect(response.error).toBeNull();
        expect(response.data).toEqual([]);
      });
    });
  });
});

describe('canvas_comments', () => {
  describe('GIVEN a viewer without comment permission', () => {
    describe('WHEN they comment on the thread', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await viewerClient
          .from('canvas_comments')
          .insert({ thread_id: thread.id, author_id: viewer.id, text: 'viewer thread comment' });
      });

      test('THEN the insert is denied by row level security', () => {
        expect(response.error?.code).toBe('42501');
      });
    });
  });

  describe('GIVEN a member holding comment permission', () => {
    describe('WHEN they comment on the thread', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await editorClient
          .from('canvas_comments')
          .insert({ thread_id: thread.id, author_id: editor.id, text: 'editor thread comment' });
      });

      test('THEN the comment is stored', () => {
        expect(response.error).toBeNull();
      });
    });

    describe("WHEN they comment under someone else's identity", () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await editorClient
          .from('canvas_comments')
          .insert({ thread_id: thread.id, author_id: author.id, text: 'forged thread comment' });
      });

      test('THEN the insert is denied by row level security', () => {
        expect(response.error?.code).toBe('42501');
      });
    });
  });
});

describe('set_canvas_node_status', () => {
  let nodeId: string;

  beforeEach(async () => {
    nodeId = await seedNode(thread.id, editor.id, { label: 'status target' });
  });

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
  let nodeId: string;

  beforeEach(async () => {
    nodeId = await seedNode(thread.id, editor.id, { label: 'answer target' });
  });

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
  });

  describe('GIVEN a viewer without edit permission', () => {
    describe('WHEN they mark the node as the answer', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await viewerClient.rpc('set_canvas_node_answer', { p_node_id: nodeId, p_is_answer: true });
      });

      test('THEN the call is denied and the node stays unmarked', async () => {
        expect(response.error?.code).toBe('42501');
        await expect(readNode(nodeId)).resolves.toMatchObject({ is_answer: false });
      });
    });
  });
});

describe('update_canvas_node_positions', () => {
  let nodeId: string;

  beforeEach(async () => {
    nodeId = await seedNode(thread.id, editor.id, { label: 'moved node' });
  });

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
