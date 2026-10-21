import type { IRichTextDocument, TCanvasNode } from '@interfaces';

import { createCanvasNode, createComment, createFormattedComment, withRichLabel } from '../../utils';

export const SB_NODE_ID = 'sb-node-1';

export const defaultNode: TCanvasNode = createCanvasNode(
  SB_NODE_ID,
  0,
  0,
  'Voting balances authority across all members of a thread.',
);

export const selectedNode: TCanvasNode = createCanvasNode(
  SB_NODE_ID,
  0,
  0,
  'Selected reasoning node with active outline.',
  null,
  [],
  true,
);

export const validNode: TCanvasNode = createCanvasNode(
  SB_NODE_ID,
  0,
  0,
  'Require provenance on publish, not on draft.',
  'valid',
);

export const invalidNode: TCanvasNode = createCanvasNode(
  SB_NODE_ID,
  0,
  0,
  'Mandatory provenance blocks quick drafts.',
  'invalid',
);

export const FORMATTED_COMMENT_DOCUMENT: IRichTextDocument = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Could a ' },
        { type: 'text', text: 'qualified majority', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' be a sensible middle ground here?' },
      ],
    },
  ],
};

export const withCommentsNode: TCanvasNode = createCanvasNode(
  SB_NODE_ID,
  0,
  0,
  'Should canvas evaluation be voting-based?',
  null,
  [
    createComment('c1', 'Voting distributes responsibility across all canvas members.'),
    createFormattedComment('c2', FORMATTED_COMMENT_DOCUMENT),
    createComment('c3', 'Concerned about speed — fast canvases stall under voting overhead.', 'sb-other'),
  ],
);

export const FORMATTED_LABEL_DOCUMENT: IRichTextDocument = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Voting ', marks: [{ type: 'bold' }] },
        { type: 'text', text: 'slows fast canvases, see the ' },
        { type: 'text', text: 'pilot notes', marks: [{ type: 'link', attrs: { href: 'https://example.com/pilot' } }] },
      ],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Risk: ', marks: [{ type: 'textColor', attrs: { color: 'red' } }] },
                { type: 'text', text: 'stalled decisions', marks: [{ type: 'italic' }] },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Unanimity', marks: [{ type: 'strike' }] },
                { type: 'text', text: ' ' },
                { type: 'text', text: 'qualified majority', marks: [{ type: 'underline' }] },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const formattedNode: TCanvasNode = withRichLabel(
  createCanvasNode(SB_NODE_ID, 0, 0, ''),
  FORMATTED_LABEL_DOCUMENT,
);

export const longLabelNode: TCanvasNode = createCanvasNode(
  SB_NODE_ID,
  0,
  0,
  'A deliberately long reasoning label that wraps onto several lines so the clamp-and-expand control surfaces. It keeps going and going across multiple lines, eventually crossing the collapse threshold so the "Show more" toggle appears beneath the label, letting reviewers read the full thought without resizing the node manually.',
);

export const pendingNode: TCanvasNode = createCanvasNode(SB_NODE_ID, 0, 0, 'Awaiting an outgoing connection.');

export const editingNode: TCanvasNode = createCanvasNode(
  SB_NODE_ID,
  0,
  0,
  'Rename me — the field is focused for editing.',
);

export const answerNode: TCanvasNode = createCanvasNode(
  SB_NODE_ID,
  0,
  0,
  'Adopt qualified-majority voting for canvas evaluation.',
  null,
  [],
  false,
  true,
);
