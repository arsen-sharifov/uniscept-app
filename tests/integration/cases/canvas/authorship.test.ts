import type { SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';

import { BACKDATED_TIMESTAMP, MISSING_ROW_ID, RICH_LABEL_DOCUMENT } from '../../consts';
import type {
  IIntegrationAccount,
  IIntegrationCommentAuthorshipRow,
  IIntegrationNodeAuthorshipRow,
  IIntegrationNodeRow,
  IIntegrationResponse,
  IIntegrationThread,
  IIntegrationWorkspace,
} from '../../interfaces';
import {
  backdateKept,
  deleteAccounts,
  getUserClient,
  isKept,
  readCommentAuthorship,
  readNode,
  readNodeAuthorship,
  seedAccount,
  seedMember,
  seedMemberWithRole,
  seedNode,
  seedNodeComment,
  seedRole,
  seedThread,
  seedWorkspace,
  uniqueLabel,
} from '../../utils';

let owner: IIntegrationAccount;
let author: IIntegrationAccount;
let editor: IIntegrationAccount;
let canvasEditor: IIntegrationAccount;
let ownerClient: SupabaseClient;
let authorClient: SupabaseClient;
let editorClient: SupabaseClient;
let canvasEditorClient: SupabaseClient;
let workspace: IIntegrationWorkspace;
let thread: IIntegrationThread;

beforeAll(async () => {
  [owner, author, editor, canvasEditor] = await Promise.all([
    seedAccount('owner'),
    seedAccount('author'),
    seedAccount('editor'),
    seedAccount('canvas-editor'),
  ]);
  workspace = await seedWorkspace(owner.id, uniqueLabel('authorship'));
  const canvasEditorRoleId = await seedRole(workspace.id, 'Canvas editor', { canEditCanvas: true });
  await Promise.all([
    seedMember(workspace.id, author.id, 'member'),
    seedMember(workspace.id, editor.id, 'member'),
    seedMemberWithRole(workspace.id, canvasEditor.id, canvasEditorRoleId),
  ]);
  thread = await seedThread(workspace.id, owner.id);
  [ownerClient, authorClient, editorClient, canvasEditorClient] = await Promise.all([
    getUserClient(owner),
    getUserClient(author),
    getUserClient(editor),
    getUserClient(canvasEditor),
  ]);
});

afterAll(async () => {
  await deleteAccounts(canvasEditor, editor, author, owner);
});

describe('canvas node text stamps', () => {
  let nodeId: string;

  beforeEach(async () => {
    nodeId = await seedNode(thread.id, author.id);
  });

  describe('GIVEN a fresh empty node of the author', () => {
    describe('WHEN the author writes its first text', () => {
      let stored: IIntegrationNodeAuthorshipRow | null;

      beforeEach(async () => {
        await authorClient.from('canvas_nodes').update({ label: 'First thought' }).eq('id', nodeId);
        stored = await readNodeAuthorship(nodeId);
      });

      test('THEN the text counts as written, not as edited', () => {
        expect(stored).toMatchObject({ label: 'First thought', edited_at: null, edited_by: null });
      });
    });

    describe('WHEN the client tries to set the edit time itself', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await authorClient.from('canvas_nodes').update({ edited_at: BACKDATED_TIMESTAMP }).eq('id', nodeId);
      });

      test('THEN the column is not writable', () => {
        expect(response.error?.code).toBe('42501');
      });
    });

    describe('WHEN the client tries to name the editor itself', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await authorClient.from('canvas_nodes').update({ edited_by: editor.id }).eq('id', nodeId);
      });

      test('THEN the column is not writable', () => {
        expect(response.error?.code).toBe('42501');
      });
    });
  });

  describe('GIVEN a new node the author creates', () => {
    describe('WHEN the client sends an edit time with it', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await authorClient.from('canvas_nodes').insert({
          thread_id: thread.id,
          type: 'canvas-node',
          label: 'Backdated claim',
          created_by: author.id,
          edited_at: BACKDATED_TIMESTAMP,
        });
      });

      test('THEN the column is not writable', () => {
        expect(response.error?.code).toBe('42501');
        expect(response.error?.message).toMatch(/permission denied for table canvas_nodes/);
      });
    });

    describe('WHEN the client sends an editor with it', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await authorClient.from('canvas_nodes').insert({
          thread_id: thread.id,
          type: 'canvas-node',
          label: 'Attributed claim',
          created_by: author.id,
          edited_by: editor.id,
        });
      });

      test('THEN the column is not writable', () => {
        expect(response.error?.code).toBe('42501');
        expect(response.error?.message).toMatch(/permission denied for table canvas_nodes/);
      });
    });
  });

  describe('GIVEN a node whose author already wrote its text', () => {
    beforeEach(async () => {
      await authorClient.from('canvas_nodes').update({ label: 'First thought' }).eq('id', nodeId);
    });

    describe('WHEN the author rewrites the text', () => {
      let stored: IIntegrationNodeAuthorshipRow | null;

      beforeEach(async () => {
        await authorClient.from('canvas_nodes').update({ label: 'Second thought' }).eq('id', nodeId);
        stored = await readNodeAuthorship(nodeId);
      });

      test('THEN the node is marked edited by its author', () => {
        expect(stored?.edited_at).not.toBeNull();
        expect(stored).toMatchObject({ label: 'Second thought', edited_by: author.id });
      });
    });

    describe('WHEN the author only adds formatting', () => {
      let stored: IIntegrationNodeAuthorshipRow | null;

      beforeEach(async () => {
        await authorClient.from('canvas_nodes').update({ rich_label: RICH_LABEL_DOCUMENT }).eq('id', nodeId);
        stored = await readNodeAuthorship(nodeId);
      });

      test('THEN the formatting change counts as an edit', () => {
        expect(stored?.edited_at).not.toBeNull();
      });
    });

    describe('WHEN the author saves the same text again', () => {
      let stored: IIntegrationNodeAuthorshipRow | null;

      beforeEach(async () => {
        await authorClient.from('canvas_nodes').update({ label: 'First thought' }).eq('id', nodeId);
        stored = await readNodeAuthorship(nodeId);
      });

      test('THEN nothing is marked edited', () => {
        expect(stored?.edited_at).toBeNull();
      });
    });

    describe('WHEN the author clears the text and writes another one', () => {
      let stored: IIntegrationNodeAuthorshipRow | null;

      beforeEach(async () => {
        await authorClient.from('canvas_nodes').update({ label: '' }).eq('id', nodeId);
        await authorClient.from('canvas_nodes').update({ label: 'Quietly replaced' }).eq('id', nodeId);
        stored = await readNodeAuthorship(nodeId);
      });

      test('THEN the node stays marked edited', () => {
        expect(stored?.edited_at).not.toBeNull();
        expect(stored).toMatchObject({ label: 'Quietly replaced', edited_by: author.id });
      });
    });

    describe('WHEN an editor moves the node and gives it a verdict', () => {
      let responses: IIntegrationResponse[];
      let node: IIntegrationNodeRow | null;
      let stored: IIntegrationNodeAuthorshipRow | null;

      beforeEach(async () => {
        responses = [
          await editorClient.rpc('update_canvas_node_positions', {
            updates: [{ id: nodeId, position_x: 120, position_y: 80 }],
          }),
          await editorClient.rpc('set_canvas_node_status', { p_node_id: nodeId, p_status: 'invalid' }),
        ];
        [node, stored] = await Promise.all([readNode(nodeId), readNodeAuthorship(nodeId)]);
      });

      test('THEN both are applied and neither counts as an edit', () => {
        expect(responses.map((response) => response.error)).toEqual([null, null]);
        expect(node).toMatchObject({ position_x: 120, position_y: 80, status: 'invalid' });
        expect(stored).toMatchObject({ edited_at: null, edited_by: null });
      });
    });
  });

  describe('GIVEN a node created with text already in it, like a duplicate', () => {
    let copyId: string;

    beforeEach(async () => {
      copyId = await seedNode(thread.id, author.id, { label: 'Copied claim' });
    });

    describe('WHEN the author changes that text', () => {
      let stored: IIntegrationNodeAuthorshipRow | null;

      beforeEach(async () => {
        await authorClient.from('canvas_nodes').update({ label: 'Changed copy' }).eq('id', copyId);
        stored = await readNodeAuthorship(copyId);
      });

      test('THEN the very first change is marked edited', () => {
        expect(stored?.edited_at).not.toBeNull();
        expect(stored).toMatchObject({ label: 'Changed copy', edited_by: author.id });
      });
    });
  });
});

describe('node comment edits', () => {
  let nodeId: string;
  let commentId: string;

  beforeEach(async () => {
    nodeId = await seedNode(thread.id, author.id, { label: 'Commented node' });
    commentId = await seedNodeComment(nodeId, author.id, 'Posted');
  });

  describe('GIVEN a posted comment of the author', () => {
    describe('WHEN the author rewrites it', () => {
      let stored: IIntegrationCommentAuthorshipRow | null;

      beforeEach(async () => {
        await authorClient.from('node_comments').update({ text: 'Reworded' }).eq('id', commentId);
        stored = await readCommentAuthorship(commentId);
      });

      test('THEN the new text is stored and the comment is marked edited', () => {
        expect(stored?.text).toBe('Reworded');
        expect(stored?.edited_at).not.toBeNull();
      });
    });

    describe('WHEN another member rewrites it', () => {
      let stored: IIntegrationCommentAuthorshipRow | null;

      beforeEach(async () => {
        await editorClient.from('node_comments').update({ text: 'Hijacked' }).eq('id', commentId);
        stored = await readCommentAuthorship(commentId);
      });

      test('THEN the comment stays as its author wrote it', () => {
        expect(stored).toMatchObject({ text: 'Posted', edited_at: null });
      });
    });

    describe('WHEN the workspace owner rewrites it', () => {
      let stored: IIntegrationCommentAuthorshipRow | null;

      beforeEach(async () => {
        await ownerClient.from('node_comments').update({ text: 'Moderated' }).eq('id', commentId);
        stored = await readCommentAuthorship(commentId);
      });

      test('THEN the comment stays as its author wrote it', () => {
        expect(stored).toMatchObject({ text: 'Posted', edited_at: null });
      });
    });

    describe('WHEN the client tries to set the edit time itself', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await authorClient
          .from('node_comments')
          .update({ edited_at: BACKDATED_TIMESTAMP })
          .eq('id', commentId);
      });

      test('THEN the column is not writable', () => {
        expect(response.error?.code).toBe('42501');
      });
    });
  });
});

describe('content of a deleted account', () => {
  let departing: IIntegrationAccount;
  let nodeId: string;
  let commentId: string;

  beforeEach(async () => {
    departing = await seedAccount('departing');
    await seedMember(workspace.id, departing.id, 'member');
    nodeId = await seedNode(thread.id, departing.id, { label: 'Left behind' });
    commentId = await seedNodeComment(nodeId, departing.id, 'Still readable');
  });

  describe('GIVEN a node and a comment written by a member', () => {
    describe('WHEN the member deletes the account', () => {
      let node: IIntegrationNodeAuthorshipRow | null;
      let comment: IIntegrationCommentAuthorshipRow | null;

      beforeEach(async () => {
        await deleteAccounts(departing);
        [node, comment] = await Promise.all([readNodeAuthorship(nodeId), readCommentAuthorship(commentId)]);
      });

      test('THEN both stay readable without an author', () => {
        expect(node).toMatchObject({ label: 'Left behind', created_by: null });
        expect(comment).toMatchObject({ text: 'Still readable', author_id: null });
      });
    });
  });
});

describe('undoing a deletion', () => {
  let nodeId: string;
  let commentId: string;
  let originalNode: IIntegrationNodeAuthorshipRow | null;
  let originalComment: IIntegrationCommentAuthorshipRow | null;

  beforeEach(async () => {
    nodeId = await seedNode(thread.id, author.id);
    await authorClient.from('canvas_nodes').update({ label: 'Draft' }).eq('id', nodeId);
    await authorClient.from('canvas_nodes').update({ label: 'Authored claim' }).eq('id', nodeId);
    commentId = await seedNodeComment(nodeId, author.id, 'Why');
    [originalNode, originalComment] = await Promise.all([readNodeAuthorship(nodeId), readCommentAuthorship(commentId)]);
    await ownerClient.from('canvas_nodes').delete().eq('id', nodeId);
  });

  describe("GIVEN the workspace owner deleted a member's node with the member's comment", () => {
    describe('WHEN the owner restores both under their own name with other text', () => {
      let node: IIntegrationNodeAuthorshipRow | null;
      let comment: IIntegrationCommentAuthorshipRow | null;
      let responses: IIntegrationResponse[];

      beforeEach(async () => {
        responses = [
          await ownerClient.from('canvas_nodes').insert({
            id: nodeId,
            thread_id: thread.id,
            type: 'canvas-node',
            label: 'Forged claim',
            created_by: owner.id,
          }),
          await ownerClient
            .from('node_comments')
            .insert({ id: commentId, node_id: nodeId, author_id: owner.id, text: 'Forged comment' }),
        ];
        [node, comment] = await Promise.all([readNodeAuthorship(nodeId), readCommentAuthorship(commentId)]);
      });

      test('THEN both come back with the original author, time and text', () => {
        expect(responses.map((response) => response.error)).toEqual([null, null]);
        expect(node).toEqual(originalNode);
        expect(comment).toEqual(originalComment);
      });
    });

    describe('WHEN the owner restores the node into another thread', () => {
      let node: IIntegrationNodeAuthorshipRow | null;

      beforeEach(async () => {
        const otherThread = await seedThread(workspace.id, owner.id);
        await ownerClient
          .from('canvas_nodes')
          .insert({ id: nodeId, thread_id: otherThread.id, type: 'canvas-node', label: 'Moved claim' });
        node = await readNodeAuthorship(nodeId);
      });

      test('THEN the node returns to the thread it was deleted from', () => {
        expect(node).toMatchObject({ thread_id: thread.id, label: 'Authored claim', created_by: author.id });
      });
    });

    describe('WHEN another editor inserts a node under the same id', () => {
      let response: IIntegrationResponse;
      let node: IIntegrationNodeAuthorshipRow | null;

      beforeEach(async () => {
        response = await editorClient
          .from('canvas_nodes')
          .insert({ id: nodeId, thread_id: thread.id, type: 'canvas-node', label: 'Own claim', created_by: editor.id });
        node = await readNodeAuthorship(nodeId);
      });

      test('THEN the id stays reserved for the undo of the owner', () => {
        expect(response.error?.code).toBe('23505');
        expect(node).toBeNull();
      });
    });

    describe('WHEN another editor slips a comment under the id of the kept comment', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        const editorNodeId = await seedNode(thread.id, editor.id, { label: 'Editor node' });
        response = await editorClient
          .from('node_comments')
          .insert({ id: commentId, node_id: editorNodeId, author_id: editor.id, text: 'Planted' });
      });

      test('THEN the comment id stays reserved for the undo of the owner', () => {
        expect(response.error?.code).toBe('23505');
      });
    });
  });
});

describe('undoing a deletion without the right to comment', () => {
  let nodeId: string;

  beforeEach(async () => {
    nodeId = await seedNode(thread.id, canvasEditor.id, { label: 'Drafted claim' });
  });

  describe('GIVEN an editor without the right to comment deleted their node with their own comment', () => {
    let commentId: string;
    let originalComment: IIntegrationCommentAuthorshipRow | null;

    beforeEach(async () => {
      commentId = await seedNodeComment(nodeId, canvasEditor.id, 'Drafted comment');
      originalComment = await readCommentAuthorship(commentId);
      await canvasEditorClient.from('canvas_nodes').delete().eq('id', nodeId);
    });

    describe('WHEN they restore both with other comment text', () => {
      let responses: IIntegrationResponse[];
      let comment: IIntegrationCommentAuthorshipRow | null;

      beforeEach(async () => {
        responses = [
          await canvasEditorClient.from('canvas_nodes').insert({
            id: nodeId,
            thread_id: thread.id,
            type: 'canvas-node',
            label: 'Drafted claim',
            created_by: canvasEditor.id,
          }),
          await canvasEditorClient
            .from('node_comments')
            .insert({ id: commentId, node_id: nodeId, author_id: canvasEditor.id, text: 'Sneaked in' }),
        ];
        comment = await readCommentAuthorship(commentId);
      });

      test('THEN the comment comes back with the text it had', () => {
        expect(responses.map((response) => response.error)).toEqual([null, null]);
        expect(comment).toEqual(originalComment);
      });
    });
  });

  describe("GIVEN an editor without the right to comment deleted their node with a member's comment", () => {
    let commentId: string;
    let originalComment: IIntegrationCommentAuthorshipRow | null;

    beforeEach(async () => {
      commentId = await seedNodeComment(nodeId, author.id, 'Member comment');
      originalComment = await readCommentAuthorship(commentId);
      await canvasEditorClient.from('canvas_nodes').delete().eq('id', nodeId);
    });

    describe('WHEN they restore both', () => {
      let responses: IIntegrationResponse[];
      let comment: IIntegrationCommentAuthorshipRow | null;

      beforeEach(async () => {
        responses = [
          await canvasEditorClient.from('canvas_nodes').insert({
            id: nodeId,
            thread_id: thread.id,
            type: 'canvas-node',
            label: 'Drafted claim',
            created_by: canvasEditor.id,
          }),
          await canvasEditorClient
            .from('node_comments')
            .insert({ id: commentId, node_id: nodeId, author_id: author.id, text: 'Member comment' }),
        ];
        comment = await readCommentAuthorship(commentId);
      });

      test("THEN the member's comment comes back as it was", () => {
        expect(responses.map((response) => response.error)).toEqual([null, null]);
        expect(comment).toEqual(originalComment);
      });
    });
  });
});

describe('undoing the deletion of an own node', () => {
  let nodeId: string;
  let originalNode: IIntegrationNodeAuthorshipRow | null;

  beforeEach(async () => {
    nodeId = await seedNode(thread.id, author.id);
    await authorClient.from('canvas_nodes').update({ label: 'Settled claim' }).eq('id', nodeId);
    originalNode = await readNodeAuthorship(nodeId);
    await authorClient.from('canvas_nodes').delete().eq('id', nodeId);
  });

  describe('GIVEN the author deleted their written node', () => {
    describe('WHEN they restore it with the same text', () => {
      let node: IIntegrationNodeAuthorshipRow | null;

      beforeEach(async () => {
        await authorClient.from('canvas_nodes').insert({
          id: nodeId,
          thread_id: thread.id,
          type: 'canvas-node',
          label: 'Settled claim',
          created_by: author.id,
        });
        node = await readNodeAuthorship(nodeId);
      });

      test('THEN it comes back exactly as it was', () => {
        expect(node).toEqual(originalNode);
      });
    });

    describe('WHEN they restore it with other text', () => {
      let node: IIntegrationNodeAuthorshipRow | null;

      beforeEach(async () => {
        await authorClient.from('canvas_nodes').insert({
          id: nodeId,
          thread_id: thread.id,
          type: 'canvas-node',
          label: 'Rewritten claim',
          created_by: author.id,
        });
        node = await readNodeAuthorship(nodeId);
      });

      test('THEN it keeps its creation time but the new text is marked edited', () => {
        expect(node?.edited_at).not.toBeNull();
        expect(node).toMatchObject({
          label: 'Rewritten claim',
          created_at: originalNode?.created_at,
          edited_by: author.id,
        });
      });
    });
  });
});

describe('undoing the deletion of an own empty node', () => {
  let nodeId: string;

  beforeEach(async () => {
    nodeId = await seedNode(thread.id, author.id);
    await authorClient.from('canvas_nodes').delete().eq('id', nodeId);
  });

  describe('GIVEN the author deleted a node before its first text was saved', () => {
    describe('WHEN they restore it with that first text', () => {
      let node: IIntegrationNodeAuthorshipRow | null;

      beforeEach(async () => {
        await authorClient.from('canvas_nodes').insert({
          id: nodeId,
          thread_id: thread.id,
          type: 'canvas-node',
          label: 'First thought',
          created_by: author.id,
        });
        node = await readNodeAuthorship(nodeId);
      });

      test('THEN the text counts as written, not as edited', () => {
        expect(node).toMatchObject({ label: 'First thought', edited_at: null, edited_by: null });
      });
    });
  });
});

describe('undoing the deletion of an own comment', () => {
  let nodeId: string;
  let commentId: string;
  let originalComment: IIntegrationCommentAuthorshipRow | null;

  beforeEach(async () => {
    nodeId = await seedNode(thread.id, author.id, { label: 'Commented node' });
    commentId = await seedNodeComment(nodeId, author.id, 'Original');
    originalComment = await readCommentAuthorship(commentId);
    await authorClient.from('node_comments').delete().eq('id', commentId);
  });

  describe('GIVEN the author deleted their comment', () => {
    describe('WHEN they restore it with the same text', () => {
      let comment: IIntegrationCommentAuthorshipRow | null;

      beforeEach(async () => {
        await authorClient
          .from('node_comments')
          .insert({ id: commentId, node_id: nodeId, author_id: author.id, text: 'Original' });
        comment = await readCommentAuthorship(commentId);
      });

      test('THEN it comes back exactly as it was', () => {
        expect(comment).toEqual(originalComment);
      });
    });

    describe('WHEN they restore it with the text they had locally', () => {
      let comment: IIntegrationCommentAuthorshipRow | null;

      beforeEach(async () => {
        await authorClient
          .from('node_comments')
          .insert({ id: commentId, node_id: nodeId, author_id: author.id, text: 'Original, reworded' });
        comment = await readCommentAuthorship(commentId);
      });

      test('THEN the comment keeps its creation time, takes the restored text and is marked edited', () => {
        expect(comment?.edited_at).not.toBeNull();
        expect(comment).toMatchObject({
          text: 'Original, reworded',
          author_id: author.id,
          created_at: originalComment?.created_at,
        });
      });
    });
  });
});

describe('undoing a deletion after seven days', () => {
  let nodeId: string;
  let commentId: string;
  let otherNodeId: string;

  beforeEach(async () => {
    nodeId = await seedNode(thread.id, author.id, { label: 'Expired claim' });
    commentId = await seedNodeComment(nodeId, author.id, 'Expired comment');
    otherNodeId = await seedNode(thread.id, editor.id, { label: 'Editor node' });
    await ownerClient.from('canvas_nodes').delete().eq('id', nodeId);
    await Promise.all([backdateKept('deleted_canvas_nodes', nodeId), backdateKept('deleted_node_comments', commentId)]);
  });

  describe("GIVEN the workspace owner deleted a member's node with the member's comment more than seven days ago", () => {
    describe("WHEN the owner restores the node under the member's name", () => {
      let response: IIntegrationResponse;
      let node: IIntegrationNodeAuthorshipRow | null;

      beforeEach(async () => {
        response = await ownerClient.from('canvas_nodes').insert({
          id: nodeId,
          thread_id: thread.id,
          type: 'canvas-node',
          label: 'Expired claim',
          created_by: author.id,
        });
        node = await readNodeAuthorship(nodeId);
      });

      test('THEN the undo is refused', () => {
        expect(response.error?.code).toBe('42501');
        expect(node).toBeNull();
      });
    });

    describe("WHEN the owner restores the comment under the member's name", () => {
      let response: IIntegrationResponse;
      let comment: IIntegrationCommentAuthorshipRow | null;

      beforeEach(async () => {
        response = await ownerClient
          .from('node_comments')
          .insert({ id: commentId, node_id: otherNodeId, author_id: author.id, text: 'Expired comment' });
        comment = await readCommentAuthorship(commentId);
      });

      test('THEN the undo is refused', () => {
        expect(response.error?.code).toBe('42501');
        expect(comment).toBeNull();
      });
    });

    describe('WHEN another editor creates a node under its id', () => {
      let response: IIntegrationResponse;
      let node: IIntegrationNodeAuthorshipRow | null;

      beforeEach(async () => {
        response = await editorClient
          .from('canvas_nodes')
          .insert({ id: nodeId, thread_id: thread.id, type: 'canvas-node', label: 'Own claim', created_by: editor.id });
        node = await readNodeAuthorship(nodeId);
      });

      test('THEN the id is free again and the node is theirs', () => {
        expect(response.error).toBeNull();
        expect(node).toMatchObject({ label: 'Own claim', created_by: editor.id });
      });
    });

    describe('WHEN another editor posts a comment under the id of the kept comment', () => {
      let response: IIntegrationResponse;
      let comment: IIntegrationCommentAuthorshipRow | null;

      beforeEach(async () => {
        response = await editorClient
          .from('node_comments')
          .insert({ id: commentId, node_id: otherNodeId, author_id: editor.id, text: 'Fresh comment' });
        comment = await readCommentAuthorship(commentId);
      });

      test('THEN the id is free again and the comment is theirs', () => {
        expect(response.error).toBeNull();
        expect(comment).toMatchObject({ node_id: otherNodeId, text: 'Fresh comment', author_id: editor.id });
      });
    });
  });
});

describe('kept copies of deleted content', () => {
  describe('GIVEN a node the author deleted with a comment', () => {
    let nodeId: string;
    let commentId: string;

    beforeEach(async () => {
      nodeId = await seedNode(thread.id, author.id, { label: 'Private claim' });
      commentId = await seedNodeComment(nodeId, author.id, 'Private comment');
      await authorClient.from('canvas_nodes').delete().eq('id', nodeId);
    });

    describe('WHEN the author reads the kept copies', () => {
      let responses: IIntegrationResponse[];

      beforeEach(async () => {
        responses = await Promise.all([
          authorClient.from('deleted_canvas_nodes').select('id').eq('id', nodeId),
          authorClient.from('deleted_node_comments').select('id').eq('id', commentId),
        ]);
      });

      test('THEN both tables are closed to them', () => {
        expect(responses.map((response) => response.error?.code)).toEqual(['42501', '42501']);
      });
    });

    describe('WHEN the author plants kept copies of their own', () => {
      let responses: IIntegrationResponse[];

      beforeEach(async () => {
        responses = await Promise.all([
          authorClient.from('deleted_canvas_nodes').insert({
            id: MISSING_ROW_ID,
            thread_id: thread.id,
            type: 'canvas-node',
            label: 'Planted claim',
            created_by: owner.id,
            created_at: BACKDATED_TIMESTAMP,
            deleted_by: author.id,
          }),
          authorClient.from('deleted_node_comments').insert({
            id: MISSING_ROW_ID,
            thread_id: thread.id,
            node_id: nodeId,
            text: 'Planted comment',
            author_id: owner.id,
            created_at: BACKDATED_TIMESTAMP,
            deleted_by: author.id,
          }),
        ]);
      });

      test('THEN both tables are closed to them', () => {
        expect(responses.map((response) => response.error?.code)).toEqual(['42501', '42501']);
      });
    });

    describe('WHEN the author deletes the kept copies', () => {
      let responses: IIntegrationResponse[];
      let kept: boolean[];

      beforeEach(async () => {
        responses = await Promise.all([
          authorClient.from('deleted_canvas_nodes').delete().eq('id', nodeId),
          authorClient.from('deleted_node_comments').delete().eq('id', commentId),
        ]);
        kept = await Promise.all([isKept('deleted_canvas_nodes', nodeId), isKept('deleted_node_comments', commentId)]);
      });

      test('THEN both tables are closed to them and the copies stay', () => {
        expect(responses.map((response) => response.error?.code)).toEqual(['42501', '42501']);
        expect(kept).toEqual([true, true]);
      });
    });
  });

  describe('GIVEN a deleted node with a comment in a thread', () => {
    let removedThread: IIntegrationThread;
    let nodeId: string;
    let commentId: string;

    beforeEach(async () => {
      removedThread = await seedThread(workspace.id, owner.id);
      nodeId = await seedNode(removedThread.id, author.id, { label: 'Doomed claim' });
      commentId = await seedNodeComment(nodeId, author.id, 'Doomed comment');
      await authorClient.from('canvas_nodes').delete().eq('id', nodeId);
    });

    describe('WHEN the thread is deleted', () => {
      let kept: boolean[];

      beforeEach(async () => {
        await ownerClient.from('threads').delete().eq('id', removedThread.id);
        kept = await Promise.all([isKept('deleted_canvas_nodes', nodeId), isKept('deleted_node_comments', commentId)]);
      });

      test('THEN the kept copies of the node and its comment go with it', () => {
        expect(kept).toEqual([false, false]);
      });
    });
  });

  describe('GIVEN a node that a reference in another thread points to', () => {
    let sourceId: string;
    let referenceId: string;

    beforeEach(async () => {
      const referringThread = await seedThread(workspace.id, owner.id);
      sourceId = await seedNode(thread.id, author.id, { label: 'Referenced claim' });
      referenceId = await seedNode(referringThread.id, editor.id, { type: 'reference-node', sourceNodeId: sourceId });
    });

    describe('WHEN its author deletes the node', () => {
      let kept: boolean[];
      let reference: IIntegrationNodeAuthorshipRow | null;

      beforeEach(async () => {
        await authorClient.from('canvas_nodes').delete().eq('id', sourceId);
        [kept, reference] = await Promise.all([
          Promise.all([isKept('deleted_canvas_nodes', sourceId), isKept('deleted_canvas_nodes', referenceId)]),
          readNodeAuthorship(referenceId),
        ]);
      });

      test('THEN the reference goes with it and only the node itself is kept for an undo', () => {
        expect(reference).toBeNull();
        expect(kept).toEqual([true, false]);
      });
    });
  });

  describe('GIVEN a node deleted more than seven days ago', () => {
    let staleId: string;

    beforeEach(async () => {
      staleId = await seedNode(thread.id, author.id, { label: 'Long gone' });
      await authorClient.from('canvas_nodes').delete().eq('id', staleId);
      await backdateKept('deleted_canvas_nodes', staleId);
    });

    describe('WHEN any node is added', () => {
      let kept: boolean;

      beforeEach(async () => {
        await authorClient
          .from('canvas_nodes')
          .insert({ thread_id: thread.id, type: 'canvas-node', label: 'Fresh claim', created_by: author.id });
        kept = await isKept('deleted_canvas_nodes', staleId);
      });

      test('THEN the stale copy is cleared away', () => {
        expect(kept).toBe(false);
      });
    });
  });
});
