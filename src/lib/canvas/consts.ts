import { Position, type XYPosition } from '@xyflow/react';

import type { THandleId } from '@interfaces';

export const POSITION_BY_HANDLE: Record<THandleId, Position> = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
};

export const SIDE_NORMALS: Record<THandleId, XYPosition> = {
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export const ARROW_LENGTH = 10;

export const EDGE_CURVATURE = 0.16;

export const ARROW_MARKER_ATTRIBUTES = {
  viewBox: '0 0 12 9',
  markerWidth: 12,
  markerHeight: 9,
  refX: 0,
  refY: 4.5,
  orient: 'auto-start-reverse',
  markerUnits: 'userSpaceOnUse',
} as const;

export const ARROW_PATH_D = 'M 0 0 L 12 4.5 L 0 9 L 2.4 4.5 Z';
