import type { ICanvasFixture } from '@story-interfaces';

import {
  buildDenseCanvas,
  createCanvasEdge,
  createCanvasNode,
  createComment,
  createQuestionNode,
  createReferenceNode,
} from '../../utils';

export const emptyCanvas: ICanvasFixture = { nodes: [], edges: [] };

export const exportCanvasFixture: ICanvasFixture = {
  nodes: [
    { ...createQuestionNode('question', 'How do we preserve the whole discussion?'), position: { x: -450, y: -240 } },
    createCanvasNode('valid', 20, -240, 'Keep the validated reasoning', 'valid'),
    createCanvasNode(
      'invalid',
      -450,
      20,
      'This premise was refuted',
      'invalid',
      [createComment('private', 'An open comment panel must stay out of the export')],
      true,
    ),
    createCanvasNode('affected', 20, 20, 'This conclusion depends on a refuted premise'),
    createCanvasNode('answer', 450, -240, 'Export the entire graph', null, [], false, true),
    createCanvasNode(
      'long',
      850,
      20,
      'Повний текст без обрізання. Café, français, português.\n'.repeat(14) + 'LAST LINE — кінець',
    ),
    {
      ...createReferenceNode(
        'reference',
        'A complete reference label that remains readable even when the original card truncates it',
        'Original thread with a longer title',
        'Source workspace',
      ),
      position: { x: 450, y: 20 },
    },
  ],
  edges: [
    createCanvasEdge('q-valid', 'question', 'valid', 'right', 'left'),
    createCanvasEdge('q-invalid', 'question', 'invalid'),
    createCanvasEdge('invalid-affected', 'invalid', 'affected', 'right', 'left'),
    createCanvasEdge('valid-answer', 'valid', 'answer', 'right', 'left'),
    createCanvasEdge('answer-reference', 'answer', 'reference'),
    createCanvasEdge('reference-answer', 'reference', 'answer'),
  ],
};

export const reasoningCanvas: ICanvasFixture = {
  nodes: [
    createCanvasNode('q', 200, 30, 'Should canvas evaluation be voting-based?'),
    createCanvasNode('a1', 30, 220, 'Voting distributes authority across all members'),
    createCanvasNode('a2', 430, 220, 'Voting slows down fast-moving canvases'),
    createCanvasNode('a3', 220, 410, 'Qualified majority balances both concerns'),
  ],
  edges: [
    createCanvasEdge('e1', 'q', 'a1'),
    createCanvasEdge('e2', 'q', 'a2'),
    createCanvasEdge('e3', 'a1', 'a3'),
    createCanvasEdge('e4', 'a2', 'a3'),
  ],
};

export const evaluatedCanvas: ICanvasFixture = {
  nodes: [
    createCanvasNode('q', 200, 30, 'Is provenance required for every reference?'),
    createCanvasNode('a1', 20, 220, 'Provenance keeps reasoning auditable over time', 'valid'),
    createCanvasNode('a2', 360, 220, 'Mandatory provenance blocks quick drafts', 'invalid', [
      createComment('c1', 'Only blocks drafts when the source is unknown.'),
      createComment('c2', 'Could be a soft warning instead of a hard block.'),
    ]),
    createCanvasNode('a3', 200, 410, 'Require provenance on publish, not on draft', 'valid'),
  ],
  edges: [
    createCanvasEdge('e1', 'q', 'a1'),
    createCanvasEdge('e2', 'q', 'a2'),
    createCanvasEdge('e3', 'a1', 'a3'),
    createCanvasEdge('e4', 'a2', 'a3'),
  ],
};

export const denseCanvas: ICanvasFixture = buildDenseCanvas();

export const resolvedCanvas: ICanvasFixture = {
  nodes: [
    createQuestionNode('q', 'Should we adopt qualified-majority voting for canvas evaluation?'),
    createCanvasNode('a1', 40, 250, 'Qualified majority balances authority and speed', 'valid'),
    createCanvasNode('a2', 40, 430, 'Adopt qualified-majority voting', null, [], false, true),
    createCanvasNode('b1', 360, 250, 'Simple majority is faster but riskier'),
  ],
  edges: [createCanvasEdge('e1', 'q', 'a1'), createCanvasEdge('e2', 'a1', 'a2'), createCanvasEdge('e3', 'q', 'b1')],
};
