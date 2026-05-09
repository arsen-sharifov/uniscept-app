import type { Node, XYPosition } from '@xyflow/react';
import type { IHandlePair, IHandlePairWithDistance, THandleId } from '@interfaces';

const HANDLE_IDS = ['top', 'right', 'bottom', 'left'] as const;

const DEFAULT_NODE_WIDTH = 160;
const DEFAULT_NODE_HEIGHT = 40;

export const isHandleId = (value: unknown): value is THandleId =>
  typeof value === 'string' && HANDLE_IDS.includes(value as THandleId);

const getHandlePosition = (node: Node, handleId: THandleId): XYPosition => {
  const width = node.measured?.width ?? DEFAULT_NODE_WIDTH;
  const height = node.measured?.height ?? DEFAULT_NODE_HEIGHT;
  const { x, y } = node.position;

  switch (handleId) {
    case 'top':
      return { x: x + width / 2, y };
    case 'right':
      return { x: x + width, y: y + height / 2 };
    case 'bottom':
      return { x: x + width / 2, y: y + height };
    case 'left':
      return { x, y: y + height / 2 };
  }
};

const distance = (a: XYPosition, b: XYPosition) => Math.hypot(a.x - b.x, a.y - b.y);

export const findNearestHandlePair = (source: Node, target: Node): IHandlePair => {
  const candidates = HANDLE_IDS.flatMap((sourceHandle) =>
    HANDLE_IDS.map((targetHandle): IHandlePair => ({ sourceHandle, targetHandle }))
  );

  const best = candidates.reduce<IHandlePairWithDistance>(
    (current, pair) => {
      const next = distance(getHandlePosition(source, pair.sourceHandle), getHandlePosition(target, pair.targetHandle));

      return next < current.distance ? { ...pair, distance: next } : current;
    },
    { sourceHandle: 'right', targetHandle: 'left', distance: Infinity }
  );

  return { sourceHandle: best.sourceHandle, targetHandle: best.targetHandle };
};
