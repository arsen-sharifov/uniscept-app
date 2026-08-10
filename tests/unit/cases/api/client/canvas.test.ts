import { describe, expect, test, vi } from 'vitest';

import { ECanvasNodeType } from '@interfaces';
import { getCanvasContent, searchReferenceTargets } from '@api/client';
import { canvasEdgeRow, canvasNodeRow, canvasNodeWithThreadRow, nodeCommentRow } from '@mocks/rows';
import { primeSupabase } from '@mocks/supabase';

vi.mock('@/lib/supabase', () => import('@mocks/supabase'));

describe('getCanvasContent', () => {
  describe('GIVEN a thread with a canvas node, a reference node and a comment', () => {
    describe('WHEN the canvas content is assembled', () => {
      test('THEN nodes carry their grouped comments and resolved reference meta', async () => {
        primeSupabase([
          {
            data: [
              canvasNodeRow(),
              canvasNodeRow({ id: 'ref1', type: ECanvasNodeType.Reference, source_node_id: 'origin', label: 'Ref' }),
            ],
          },
          { data: [canvasEdgeRow()] },
          { data: [nodeCommentRow()] },
          {
            data: [
              canvasNodeWithThreadRow({
                id: 'origin',
                label: 'Origin node',
                threads: {
                  id: 'th-2',
                  name: 'Other thread',
                  workspace_id: 'ws-2',
                  workspaces: { name: 'Other workspace' },
                },
              }),
            ],
          },
        ]);

        await expect(getCanvasContent('th-1')).resolves.toEqual({
          nodes: [
            {
              id: 'n1',
              type: ECanvasNodeType.Canvas,
              position: { x: 10, y: 20 },
              data: {
                label: 'Node',
                status: null,
                isAnswer: false,
                comments: [{ id: 'c-1', text: 'Comment', authorId: 'user-1' }],
                createdBy: 'user-1',
              },
            },
            {
              id: 'ref1',
              type: ECanvasNodeType.Reference,
              position: { x: 10, y: 20 },
              data: {
                label: 'Ref',
                sourceNodeId: 'origin',
                sourceNodeLabel: 'Origin node',
                sourceThreadId: 'th-2',
                sourceThreadName: 'Other thread',
                sourceWorkspaceId: 'ws-2',
                sourceWorkspaceName: 'Other workspace',
                createdBy: 'user-1',
              },
            },
          ],
          edges: [
            { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'right', targetHandle: 'left', type: 'default' },
          ],
        });
      });
    });
  });

  describe('GIVEN two canvas nodes each with their own comments', () => {
    describe('WHEN the canvas content is assembled', () => {
      test('THEN each node receives only its own grouped comments', async () => {
        primeSupabase([
          { data: [canvasNodeRow(), canvasNodeRow({ id: 'n2', label: 'Second' })] },
          { data: [] },
          {
            data: [
              nodeCommentRow({ id: 'c-1', node_id: 'n1', text: 'First comment' }),
              nodeCommentRow({ id: 'c-2', node_id: 'n2', text: 'Second comment' }),
              nodeCommentRow({ id: 'c-3', node_id: 'n1', text: 'Another for n1' }),
            ],
          },
        ]);

        await expect(getCanvasContent('th-1')).resolves.toMatchObject({
          nodes: [
            expect.objectContaining({
              id: 'n1',
              data: expect.objectContaining({
                comments: [
                  { id: 'c-1', text: 'First comment', authorId: 'user-1' },
                  { id: 'c-3', text: 'Another for n1', authorId: 'user-1' },
                ],
              }),
            }),
            expect.objectContaining({
              id: 'n2',
              data: expect.objectContaining({
                comments: [{ id: 'c-2', text: 'Second comment', authorId: 'user-1' }],
              }),
            }),
          ],
        });
      });
    });
  });

  describe('GIVEN a reference node whose source is missing from the lookup', () => {
    describe('WHEN the canvas content is assembled', () => {
      test('THEN the reference falls back to the row label and empty source fields', async () => {
        primeSupabase([
          {
            data: [
              canvasNodeRow({ id: 'ref1', type: ECanvasNodeType.Reference, source_node_id: 'gone', label: 'Ref' }),
            ],
          },
          { data: [] },
          { data: [] },
          { data: [] },
        ]);

        await expect(getCanvasContent('th-1')).resolves.toMatchObject({
          nodes: [
            expect.objectContaining({
              id: 'ref1',
              data: expect.objectContaining({
                sourceNodeId: 'gone',
                sourceNodeLabel: 'Ref',
                sourceThreadId: '',
                sourceThreadName: '',
                sourceWorkspaceId: '',
                sourceWorkspaceName: '',
              }),
            }),
          ],
        });
      });
    });
  });

  describe('GIVEN a thread without reference nodes', () => {
    describe('WHEN the canvas content is assembled', () => {
      test('THEN the reference target lookup is skipped', async () => {
        const { client } = primeSupabase([{ data: [canvasNodeRow()] }, { data: [] }, { data: [] }]);

        await expect(getCanvasContent('th-1')).resolves.toMatchObject({
          nodes: [expect.objectContaining({ id: 'n1' })],
          edges: [],
        });
        expect(client.from).toHaveBeenCalledTimes(3);
      });
    });
  });
});

describe('searchReferenceTargets', () => {
  describe('GIVEN matching canvas nodes in the workspace', () => {
    describe('WHEN reference targets are searched', () => {
      test('THEN the rows map to node references', async () => {
        primeSupabase([{ data: [canvasNodeWithThreadRow()] }]);

        await expect(searchReferenceTargets('ws-1', 'th-exclude')).resolves.toEqual([
          {
            id: 'n1',
            label: 'Origin node',
            threadId: 'th-1',
            threadName: 'Thread',
            workspaceId: 'ws-1',
            workspaceName: 'Workspace',
          },
        ]);
      });
    });
  });

  describe('GIVEN no matching nodes', () => {
    describe('WHEN reference targets are searched', () => {
      test('THEN an empty list is returned', async () => {
        primeSupabase([{ data: null }]);

        await expect(searchReferenceTargets('ws-1')).resolves.toEqual([]);
      });
    });
  });

  describe('GIVEN an excluded thread', () => {
    describe('WHEN reference targets are searched', () => {
      test('THEN the exclusion filter is applied', async () => {
        const { queries } = primeSupabase([{ data: [canvasNodeWithThreadRow()] }]);
        const neq = vi.spyOn(queries[0]!, 'neq');

        await searchReferenceTargets('ws-1', 'th-exclude');

        expect(neq).toHaveBeenCalledExactlyOnceWith('thread_id', 'th-exclude');
      });
    });
  });

  describe('GIVEN no excluded thread', () => {
    describe('WHEN reference targets are searched', () => {
      test('THEN the exclusion filter is skipped', async () => {
        const { queries } = primeSupabase([{ data: [canvasNodeWithThreadRow()] }]);
        const neq = vi.spyOn(queries[0]!, 'neq');

        await searchReferenceTargets('ws-1');

        expect(neq).not.toHaveBeenCalled();
      });
    });
  });
});
