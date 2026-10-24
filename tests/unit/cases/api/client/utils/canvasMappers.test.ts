import { describe, expect, test } from 'vitest';

import { ECanvasNodeType } from '@interfaces';
import { rowToEdge, rowToNode, toCanvasAuthors } from '@api/client';
import {
  EMPTY_DOCUMENT_JSON,
  FORMATTED_DOCUMENT,
  PARSED_UNTRUSTED_DOCUMENT,
  UNTRUSTED_DOCUMENT,
} from '@mocks/richText';
import { workspaceMember } from '@mocks/roles';
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
            comments: [{ id: 'c-1', text: 'Comment', authorId: 'user-1', createdAt: '2026-01-01T00:00:00Z' }],
            createdBy: 'user-1',
            createdAt: '2026-01-01T00:00:00Z',
            editedAt: undefined,
            editedBy: undefined,
          },
        });
      });

      test('THEN the node carries no formatting', () => {
        expect(rowToNode(canvasNodeRow(), [nodeCommentRow()])).toMatchObject({ data: { richLabel: undefined } });
      });
    });
  });

  describe('GIVEN a canvas node row with a stored formatted label', () => {
    describe('WHEN it is mapped', () => {
      test('THEN the node carries the formatting', () => {
        expect(rowToNode(canvasNodeRow({ rich_label: FORMATTED_DOCUMENT }))).toHaveProperty(
          'data.richLabel',
          FORMATTED_DOCUMENT,
        );
      });
    });
  });

  describe('GIVEN a canvas node row with untrusted label formatting', () => {
    describe('WHEN it is mapped', () => {
      test('THEN only the sanitized formatting is kept', () => {
        expect(rowToNode(canvasNodeRow({ rich_label: UNTRUSTED_DOCUMENT }))).toHaveProperty(
          'data.richLabel',
          PARSED_UNTRUSTED_DOCUMENT,
        );
      });
    });
  });

  describe('GIVEN a canvas node row whose stored formatting holds no usable content', () => {
    describe('WHEN it is mapped', () => {
      test('THEN the node carries no formatting', () => {
        expect(rowToNode(canvasNodeRow({ rich_label: EMPTY_DOCUMENT_JSON }))).toMatchObject({
          data: { richLabel: undefined },
        });
      });
    });
  });

  describe('GIVEN a question node row with a stored formatted label', () => {
    describe('WHEN it is mapped', () => {
      test('THEN the question carries the formatting', () => {
        expect(
          rowToNode(canvasNodeRow({ type: ECanvasNodeType.Question, rich_label: FORMATTED_DOCUMENT })),
        ).toHaveProperty('data.richLabel', FORMATTED_DOCUMENT);
      });
    });
  });

  describe('GIVEN a question node row whose stored formatting holds no usable content', () => {
    describe('WHEN it is mapped', () => {
      test('THEN the question carries no formatting', () => {
        expect(
          rowToNode(canvasNodeRow({ type: ECanvasNodeType.Question, rich_label: EMPTY_DOCUMENT_JSON })),
        ).toMatchObject({ data: { richLabel: undefined } });
      });
    });
  });

  describe('GIVEN a reference node row with stored formatting', () => {
    describe('WHEN it is mapped', () => {
      test('THEN the reference never carries a formatting key', () => {
        expect(
          rowToNode(canvasNodeRow({ type: ECanvasNodeType.Reference, rich_label: FORMATTED_DOCUMENT })),
        ).not.toHaveProperty('data.richLabel');
      });
    });
  });

  describe('GIVEN a canvas node row whose text was edited', () => {
    describe('WHEN it is mapped', () => {
      test('THEN the edit stamps are carried over', () => {
        expect(rowToNode(canvasNodeRow({ edited_at: '2026-01-02T00:00:00Z', edited_by: 'user-1' }))).toMatchObject({
          data: { editedAt: '2026-01-02T00:00:00Z', editedBy: 'user-1' },
        });
      });
    });
  });

  describe('GIVEN a question node row whose text was edited', () => {
    describe('WHEN it is mapped', () => {
      test('THEN the question carries the edit stamps', () => {
        expect(
          rowToNode(
            canvasNodeRow({ type: ECanvasNodeType.Question, edited_at: '2026-01-02T00:00:00Z', edited_by: 'user-1' }),
          ),
        ).toMatchObject({ data: { createdAt: '2026-01-01T00:00:00Z', editedAt: '2026-01-02T00:00:00Z' } });
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
          data: { comments: [{ id: 'c-1', text: 'Comment', authorId: 'user-1', createdAt: '2026-01-01T00:00:00Z' }] },
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
            createdAt: '2026-01-01T00:00:00Z',
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

describe('toCanvasAuthors', () => {
  describe('GIVEN workspace members with and without a display name', () => {
    describe('WHEN the authors are mapped', () => {
      test('THEN each member is keyed by id and a nameless member falls back to the email', () => {
        expect(
          toCanvasAuthors([
            workspaceMember('user-1', 'role-member', { name: 'Dana Park', avatarIcon: 'panda' }),
            workspaceMember('user-2', 'role-member', { name: '' }),
          ]),
        ).toEqual({
          'user-1': { name: 'Dana Park', avatarIcon: 'panda' },
          'user-2': { name: 'user-2@uniscept.dev', avatarIcon: null },
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
