import type { CSSProperties } from 'react';
import { BackgroundVariant, type DefaultEdgeOptions, Position } from '@xyflow/react';
import type { TCanvasPattern, TEdgeTone, THandleId, TSaveStatus } from '@interfaces';

export const HANDLE_POSITIONS: { id: THandleId; position: Position }[] = [
  { id: 'top', position: Position.Top },
  { id: 'left', position: Position.Left },
  { id: 'right', position: Position.Right },
  { id: 'bottom', position: Position.Bottom },
];

export const SAVE_STATUS_REFRESH_INTERVAL_MS = 15_000;

export const INPUT_FOCUS_DELAY_MS = 60;

export const ARROW_LENGTH = 10;

export const ARRIVAL_FIT_DURATION_MS = 700;
export const ARRIVAL_FIT_PADDING = 0.25;
export const ARRIVAL_CLEANUP_MS = 1600;

export const BACKGROUND_DOT_GAP = 22;
export const BACKGROUND_COLOR_FALLBACK = 'rgb(15 23 42 / 0.22)';

export const BACKGROUND_SIZE_BY_PATTERN: Record<Exclude<TCanvasPattern, 'none'>, number> = {
  dots: 1.8,
  lines: 1.1,
  cross: 6,
};

export const BACKGROUND_VARIANT_BY_PATTERN: Record<Exclude<TCanvasPattern, 'none'>, BackgroundVariant> = {
  dots: BackgroundVariant.Dots,
  lines: BackgroundVariant.Lines,
  cross: BackgroundVariant.Cross,
};

export const RUBBER_LINE_STROKE_FALLBACK = 'rgba(34, 211, 238, 0.7)';
export const RUBBER_LINE_DOT_FILL_FALLBACK = 'rgb(34, 211, 238)';
export const ACCENT_GLOW_FALLBACK = 'rgba(34, 211, 238, 0.45)';
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

export const EDGE_TONES: readonly TEdgeTone[] = ['default', 'valid', 'invalid', 'tainted'];

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
    strokeWidth: EDGE_DEFAULT_STROKE_WIDTH,
  },
};

export const SELECT_DELETE_KEYS = ['Backspace', 'Delete'];

export const ARIA_LABEL_KEY_BY_STATUS: Partial<Record<TSaveStatus, 'errorTitle' | 'offline' | 'saving' | 'saved'>> = {
  error: 'errorTitle',
  offline: 'offline',
  saved: 'saved',
};

export const LABEL_CLAMP_STYLE: CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 10,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

export const TEXTAREA_FIELD_SIZING_STYLE = {
  fieldSizing: 'content',
} as CSSProperties;
