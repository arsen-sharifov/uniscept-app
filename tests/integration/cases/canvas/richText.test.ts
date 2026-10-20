import type { SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';

import {
  NOT_A_DOCUMENT,
  OVERSIZED_RICH_DOCUMENT,
  RESTYLED_LABEL_DOCUMENT,
  RICH_LABEL_DOCUMENT,
  RICH_LABEL_TEXT,
} from '../../consts';
import type {
  IIntegrationAccount,
  IIntegrationResponse,
  IIntegrationRichCommentRow,
  IIntegrationRichLabelRow,
  IIntegrationThread,
  IIntegrationWorkspace,
} from '../../interfaces';
import {
  deleteAccounts,
  getUserClient,
  readNodeCommentRichText,
  readNodeRichLabel,
  seedAccount,
  seedMember,
  seedNode,
  seedNodeComment,
  seedThread,
  seedWorkspace,
  uniqueLabel,
} from '../../utils';

let owner: IIntegrationAccount;
let author: IIntegrationAccount;
let authorClient: SupabaseClient;
let workspace: IIntegrationWorkspace;
let thread: IIntegrationThread;

beforeAll(async () => {
  [owner, author] = await Promise.all([seedAccount('owner'), seedAccount('author')]);
  workspace = await seedWorkspace(owner.id, uniqueLabel('rich-text'));
  await seedMember(workspace.id, author.id, 'member');
  thread = await seedThread(workspace.id, owner.id);
  authorClient = await getUserClient(author);
});

afterAll(async () => {
  await deleteAccounts(author, owner);
});

describe('canvas_nodes.rich_label', () => {
  describe('GIVEN a member creating nodes', () => {
    describe('WHEN they insert a node with formatting', () => {
      let response: IIntegrationResponse<{ id: string }>;

      beforeEach(async () => {
        response = await authorClient
          .from('canvas_nodes')
          .insert({
            thread_id: thread.id,
            type: 'canvas-node',
            label: RICH_LABEL_TEXT,
            rich_label: RICH_LABEL_DOCUMENT,
          })
          .select('id')
          .single<{ id: string }>();
      });

      test('THEN the formatting is stored next to the plain label', async () => {
        expect(response.error).toBeNull();
        await expect(readNodeRichLabel(response.data!.id)).resolves.toEqual({
          label: RICH_LABEL_TEXT,
          rich_label: RICH_LABEL_DOCUMENT,
        });
      });
    });

    describe('WHEN they insert formatting that is not a document', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await authorClient
          .from('canvas_nodes')
          .insert({ thread_id: thread.id, type: 'canvas-node', label: 'Not a doc', rich_label: NOT_A_DOCUMENT });
      });

      test('THEN the check constraint rejects it', () => {
        expect(response.error?.code).toBe('23514');
      });
    });

    describe('WHEN they insert formatting past the size cap', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await authorClient
          .from('canvas_nodes')
          .insert({ thread_id: thread.id, type: 'canvas-node', label: 'Huge', rich_label: OVERSIZED_RICH_DOCUMENT });
      });

      test('THEN the check constraint rejects it', () => {
        expect(response.error?.code).toBe('23514');
      });
    });
  });

  describe('GIVEN a formatted node of the member', () => {
    let nodeId: string;

    beforeEach(async () => {
      nodeId = await seedNode(thread.id, author.id, { label: RICH_LABEL_TEXT });
      await authorClient.from('canvas_nodes').update({ rich_label: RICH_LABEL_DOCUMENT }).eq('id', nodeId);
    });

    describe('WHEN only the formatting changes', () => {
      let stored: IIntegrationRichLabelRow | null;

      beforeEach(async () => {
        await authorClient
          .from('canvas_nodes')
          .update({ label: RICH_LABEL_TEXT, rich_label: RESTYLED_LABEL_DOCUMENT })
          .eq('id', nodeId);
        stored = await readNodeRichLabel(nodeId);
      });

      test('THEN the new formatting is kept', () => {
        expect(stored).toEqual({ label: RICH_LABEL_TEXT, rich_label: RESTYLED_LABEL_DOCUMENT });
      });
    });

    describe('WHEN an older client rewrites only the plain label', () => {
      let stored: IIntegrationRichLabelRow | null;

      beforeEach(async () => {
        await authorClient.from('canvas_nodes').update({ label: 'Rewritten elsewhere' }).eq('id', nodeId);
        stored = await readNodeRichLabel(nodeId);
      });

      test('THEN the stale formatting is dropped so the new text shows', () => {
        expect(stored).toEqual({ label: 'Rewritten elsewhere', rich_label: null });
      });
    });

    describe('WHEN the formatting is cleared together with a text change', () => {
      let stored: IIntegrationRichLabelRow | null;

      beforeEach(async () => {
        await authorClient.from('canvas_nodes').update({ label: 'Plain again', rich_label: null }).eq('id', nodeId);
        stored = await readNodeRichLabel(nodeId);
      });

      test('THEN the node is plain text again', () => {
        expect(stored).toEqual({ label: 'Plain again', rich_label: null });
      });
    });
  });
});

describe('node_comments.rich_text', () => {
  describe('GIVEN a node of the workspace', () => {
    let nodeId: string;

    beforeEach(async () => {
      nodeId = await seedNode(thread.id, author.id, { label: 'Discussed' });
    });

    describe('WHEN a member posts a formatted comment', () => {
      let response: IIntegrationResponse<{ id: string }>;
      let stored: IIntegrationRichCommentRow | null;

      beforeEach(async () => {
        response = await authorClient
          .from('node_comments')
          .insert({ node_id: nodeId, author_id: author.id, text: RICH_LABEL_TEXT, rich_text: RICH_LABEL_DOCUMENT })
          .select('id')
          .single<{ id: string }>();
        stored = await readNodeCommentRichText(response.data!.id);
      });

      test('THEN the formatting is stored with the comment', () => {
        expect(response.error).toBeNull();
        expect(stored).toEqual({ text: RICH_LABEL_TEXT, rich_text: RICH_LABEL_DOCUMENT });
      });
    });

    describe('WHEN a member posts a comment whose formatting is not a document', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await authorClient
          .from('node_comments')
          .insert({ node_id: nodeId, author_id: author.id, text: 'Broken', rich_text: NOT_A_DOCUMENT });
      });

      test('THEN the check constraint rejects it', () => {
        expect(response.error?.code).toBe('23514');
      });
    });
  });

  describe('GIVEN a formatted comment of the member', () => {
    let commentId: string;

    beforeEach(async () => {
      const nodeId = await seedNode(thread.id, author.id, { label: 'Reworded' });
      const created = await authorClient
        .from('node_comments')
        .insert({ node_id: nodeId, author_id: author.id, text: RICH_LABEL_TEXT, rich_text: RICH_LABEL_DOCUMENT })
        .select('id')
        .single<{ id: string }>();
      commentId = created.data!.id;
    });

    describe('WHEN its author rewrites only the plain text', () => {
      let stored: IIntegrationRichCommentRow | null;

      beforeEach(async () => {
        await authorClient.from('node_comments').update({ text: 'Reworded elsewhere' }).eq('id', commentId);
        stored = await readNodeCommentRichText(commentId);
      });

      test('THEN the stale formatting is dropped so the new text shows', () => {
        expect(stored).toEqual({ text: 'Reworded elsewhere', rich_text: null });
      });
    });
  });

  describe('GIVEN a posted comment of the member', () => {
    let commentId: string;

    beforeEach(async () => {
      const nodeId = await seedNode(thread.id, author.id, { label: 'Commented' });
      commentId = await seedNodeComment(nodeId, author.id, 'Original');
    });

    describe('WHEN its author tries to add formatting afterwards', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await authorClient
          .from('node_comments')
          .update({ rich_text: RICH_LABEL_DOCUMENT })
          .eq('id', commentId);
      });

      test('THEN the column cannot be updated', async () => {
        expect(response.error?.code).toBe('42501');
        await expect(readNodeCommentRichText(commentId)).resolves.toEqual({ text: 'Original', rich_text: null });
      });
    });
  });
});
