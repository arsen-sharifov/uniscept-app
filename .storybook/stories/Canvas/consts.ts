import type { ICanvasFixture } from '@story-interfaces';
import { buildDenseCanvas, createCanvasEdge, createCanvasNode, createComment } from '../../utils';

export const emptyCanvas: ICanvasFixture = { nodes: [], edges: [] };

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
