import type { Edge } from '@xyflow/react';
import { ECanvasNodeType, type IComment, type TCanvasNode, type TNodeStatus } from '@interfaces';
import type { ICanvasFixture } from '@story-interfaces';
import { STORYBOOK_AUTHOR_ID } from '../consts';

export const createCanvasNode = (
  id: string,
  x: number,
  y: number,
  label: string,
  status: TNodeStatus = null,
  comments: IComment[] = [],
  selected: boolean = false
): TCanvasNode => ({
  id,
  type: ECanvasNodeType.Canvas,
  position: { x, y },
  selected,
  data: { label, status, comments },
});

export const createCanvasEdge = (id: string, source: string, target: string): Edge => ({
  id,
  source,
  target,
  sourceHandle: 'bottom',
  targetHandle: 'top',
  type: 'default',
});

export const createComment = (id: string, text: string, authorId: string = STORYBOOK_AUTHOR_ID): IComment => ({
  id,
  text,
  authorId,
});

export const buildDenseCanvas = (): ICanvasFixture => ({
  nodes: Array.from({ length: 12 }, (_, i) =>
    createCanvasNode(
      `n${i}`,
      (i % 4) * 240 + 40,
      Math.floor(i / 4) * 170 + 40,
      `Reasoning node ${i + 1}`,
      i % 5 === 0 ? 'valid' : i % 7 === 0 ? 'invalid' : null
    )
  ),
  edges: Array.from({ length: 8 }, (_, i) => createCanvasEdge(`de${i}`, `n${i}`, `n${i + 4}`)),
});
