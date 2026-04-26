import type { CSSProperties } from 'react';
import { type DefaultEdgeOptions, Position } from '@xyflow/react';
import type { IEdgePaletteEntry, TEdgeTone, THandleId } from '@interfaces';

export const HANDLE_POSITIONS: { id: THandleId; position: Position }[] = [
  { id: 'top', position: Position.Top },
  { id: 'left', position: Position.Left },
  { id: 'right', position: Position.Right },
  { id: 'bottom', position: Position.Bottom },
];

export const SAVE_STATUS_REFRESH_INTERVAL_MS = 15_000;

export const INPUT_FOCUS_DELAY_MS = 60;

const COLLAPSE_LINES = 10;

export const ARROW_LENGTH = 10;

export const ARRIVAL_FIT_DURATION_MS = 700;
export const ARRIVAL_FIT_PADDING = 0.25;
export const ARRIVAL_CLEANUP_MS = 1600;

export const BACKGROUND_DOT_GAP = 22;
export const BACKGROUND_DOT_SIZE = 1.2;
export const BACKGROUND_DOT_COLOR = 'rgb(15 23 42 / 0.10)';

export const RUBBER_LINE_STROKE = 'rgb(6 182 212 / 0.7)';
export const RUBBER_LINE_DOT_FILL = 'rgb(6 182 212)';
export const RUBBER_LINE_STROKE_WIDTH = 2;
export const RUBBER_LINE_DASH_ARRAY = '6 4';
export const RUBBER_LINE_DOT_RADIUS = 3.5;
export const RUBBER_LINE_DOT_STROKE_WIDTH = 1.5;

export const CONNECTION_RADIUS = 32;
export const NODE_DRAG_THRESHOLD = 3;

export const ZOOM_STEP_FACTOR = 1.25;
export const ZOOM_MIN = 0.2;
export const ZOOM_MAX = 4;
export const ZOOM_DURATION_MS = 200;

export const PAN_BUTTONS_ALL: number[] = [0, 1];
export const PAN_BUTTONS_MIDDLE: number[] = [1];

export const EDGE_DEFAULT_STROKE_WIDTH = 1.75;

export const EDGE_PALETTE: Record<TEdgeTone, IEdgePaletteEntry> = {
  default: {
    stroke: 'rgb(100 116 139 / 0.6)',
    marker: 'rgb(100 116 139 / 0.85)',
  },
  valid: {
    stroke: 'rgb(16 185 129 / 0.7)',
    marker: 'rgb(16 185 129 / 0.95)',
  },
  invalid: {
    stroke: 'rgb(239 68 68 / 0.7)',
    marker: 'rgb(239 68 68 / 0.95)',
  },
  tainted: {
    stroke: 'rgb(245 158 11 / 0.7)',
    marker: 'rgb(245 158 11 / 0.95)',
  },
};

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

export const DEFAULT_EDGE_OPTIONS: DefaultEdgeOptions = {
  type: 'default',
  style: {
    stroke: EDGE_PALETTE.default.stroke,
    strokeWidth: EDGE_DEFAULT_STROKE_WIDTH,
  },
};

export const PALETTE_ENTRIES = Object.entries(EDGE_PALETTE) as [TEdgeTone, IEdgePaletteEntry][];

export const SELECT_DELETE_KEYS = ['Backspace', 'Delete'];

export const LABEL_CLAMP_STYLE: CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: COLLAPSE_LINES,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

export const TEXTAREA_FIELD_SIZING_STYLE = {
  fieldSizing: 'content',
} as CSSProperties;
