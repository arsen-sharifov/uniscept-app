import type { Node, XYPosition } from '@xyflow/react';
import type { THandleId } from '@interfaces';
import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH, HANDLE_IDS } from '../consts';

export const getHandlePosition = (
  node: Node,
  handleId: THandleId
): XYPosition => {
  const w = node.measured?.width ?? DEFAULT_NODE_WIDTH;
  const h = node.measured?.height ?? DEFAULT_NODE_HEIGHT;
  const x = node.position.x;
  const y = node.position.y;

  switch (handleId) {
    case 'top':
      return { x: x + w / 2, y };
    case 'right':
      return { x: x + w, y: y + h / 2 };
    case 'bottom':
      return { x: x + w / 2, y: y + h };
    case 'left':
      return { x, y: y + h / 2 };
  }
};

const dist = (a: XYPosition, b: XYPosition) => Math.hypot(a.x - b.x, a.y - b.y);

export const findNearestHandlePair = (
  source: Node,
  target: Node
): { sourceHandle: THandleId; targetHandle: THandleId } => {
  let minDist = Infinity;
  let best = {
    sourceHandle: 'right' as THandleId,
    targetHandle: 'left' as THandleId,
  };

  for (const sh of HANDLE_IDS) {
    for (const th of HANDLE_IDS) {
      const d = dist(
        getHandlePosition(source, sh),
        getHandlePosition(target, th)
      );
      if (d < minDist) {
        minDist = d;
        best = { sourceHandle: sh, targetHandle: th };
      }
    }
  }
  return best;
};
