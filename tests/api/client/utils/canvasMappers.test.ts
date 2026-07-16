import { describe, expect, test } from 'vitest';

import { ECanvasNodeType } from '@interfaces';
import { rowToEdge, rowToNode } from '@api/client';
import { canvasEdgeRow, canvasNodeRow, nodeCommentRow } from '@mocks/rows';

describe('rowToNode', () => {
  describe('GIVEN a canvas node row with comments', () => {
    describe('WHEN it is mapped', () => {
      test('THEN the node carries position, status and mapped comments', () => {
        const node = rowToNode(canvasNodeRow({ status: 'valid', is_answer: true }), [nodeCommentRow()]);

        expect(node).toEqual({
          id: 'n1',
          type: ECanvasNodeType.Canvas,
          position: { x: 10, y: 20 },
          data: {
            label: 'Node',
            status: 'valid',
            isAnswer: true,
            comments: [{ id: 'c-1', text: 'Comment', authorId: 'user-1' }],
            createdBy: 'user-1',
          },
        });
      });
    });
  });

  describe('GIVEN a canvas node row without an author', () => {
    describe('WHEN it is mapped', () => {
      test('THEN createdBy falls back to undefined', () => {
        expect(rowToNode(canvasNodeRow({ created_by: null }))).toMatchObject({ data: { createdBy: undefined } });
      });
    });
  });

  describe('GIVEN a question node row with stray status and answer flags', () => {
    describe('WHEN it is mapped', () => {
      test('THEN the question is not deletable and ignores status and answer', () => {
        const node = rowToNode(canvasNodeRow({ type: ECanvasNodeType.Question, status: 'valid', is_answer: true }));

        expect(node).toMatchObject({
          type: ECanvasNodeType.Question,
          deletable: false,
          data: { status: null, isAnswer: false },
        });
      });
    });
  });

  describe('GIVEN a question node row with comments', () => {
    describe('WHEN it is mapped', () => {
      test('THEN the mapped comments are carried over', () => {
        expect(rowToNode(canvasNodeRow({ type: ECanvasNodeType.Question }), [nodeCommentRow()])).toMatchObject({
          type: ECanvasNodeType.Question,
          data: { comments: [{ id: 'c-1', text: 'Comment', authorId: 'user-1' }] },
        });
      });
    });
  });

  describe('GIVEN a reference node row with resolved target meta', () => {
    describe('WHEN it is mapped', () => {
      test('THEN the reference data carries the source meta', () => {
        const node = rowToNode(canvasNodeRow({ type: ECanvasNodeType.Reference, source_node_id: 'origin' }), [], {
          nodeLabel: 'Origin node',
          threadId: 'th-2',
          threadName: 'Other thread',
          workspaceId: 'ws-2',
          workspaceName: 'Other workspace',
        });

        expect(node).toEqual({
          id: 'n1',
          type: ECanvasNodeType.Reference,
          position: { x: 10, y: 20 },
          data: {
            label: 'Node',
            sourceNodeId: 'origin',
            sourceNodeLabel: 'Origin node',
            sourceThreadId: 'th-2',
            sourceThreadName: 'Other thread',
            sourceWorkspaceId: 'ws-2',
            sourceWorkspaceName: 'Other workspace',
            createdBy: 'user-1',
          },
        });
      });
    });
  });

  describe('GIVEN a reference node row without target meta', () => {
    describe('WHEN it is mapped', () => {
      test('THEN the source fields fall back to the row label and empty strings', () => {
        expect(rowToNode(canvasNodeRow({ type: ECanvasNodeType.Reference }))).toMatchObject({
          data: {
            sourceNodeId: '',
            sourceNodeLabel: 'Node',
            sourceThreadId: '',
            sourceThreadName: '',
            sourceWorkspaceId: '',
            sourceWorkspaceName: '',
          },
        });
      });
    });
  });
});

describe('rowToEdge', () => {
  describe('GIVEN an edge row', () => {
    describe('WHEN it is mapped', () => {
      test('THEN the endpoints and handles map to the edge shape', () => {
        expect(rowToEdge(canvasEdgeRow())).toEqual({
          id: 'e1',
          source: 'n1',
          target: 'n2',
          sourceHandle: 'right',
          targetHandle: 'left',
          type: 'default',
        });
      });
    });
  });
});
