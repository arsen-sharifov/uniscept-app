import { BackgroundVariant, type DefaultEdgeOptions, Position } from '@xyflow/react';
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Flag,
  HelpCircle,
  Link2,
  type LucideIcon,
  XCircle,
} from 'lucide-react';

import type {
  ICanvasSkeletonNode,
  TCanvasPattern,
  TEdgeTone,
  THandleId,
  TNodeBandTone,
  TValidationAction,
  TVisibleSaveStatus,
} from '@interfaces';

import { ECanvasTool } from '@/components/tools';

export const HANDLE_POSITIONS: { id: THandleId; position: Position }[] = [
  { id: 'top', position: Position.Top },
  { id: 'left', position: Position.Left },
  { id: 'right', position: Position.Right },
  { id: 'bottom', position: Position.Bottom },
];

export const ARROW_LENGTH = 10;

export const ARRIVAL_FIT_DURATION_MS = 700;
export const ARRIVAL_FIT_PADDING = 0.25;
export const ARRIVAL_CLEANUP_MS = 1600;

export const BACKGROUND_DOT_GAP = 26;
export const BACKGROUND_COLOR_FALLBACK = 'rgba(13, 19, 16, 0.16)';

export const BACKGROUND_SIZE_BY_PATTERN: Record<Exclude<TCanvasPattern, 'none'>, number> = {
  dots: 1.5,
  lines: 1.1,
  cross: 6,
};

export const BACKGROUND_VARIANT_BY_PATTERN: Record<Exclude<TCanvasPattern, 'none'>, BackgroundVariant> = {
  dots: BackgroundVariant.Dots,
  lines: BackgroundVariant.Lines,
  cross: BackgroundVariant.Cross,
};

export const RUBBER_LINE_STROKE_FALLBACK = '#4ade80';
export const RUBBER_LINE_DOT_FILL_FALLBACK = '#4ade80';
export const ACCENT_GLOW_FALLBACK = 'rgba(22, 163, 74, 0.28)';
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

export const SNAP_GRID_PX = 16;
export const SNAP_GRID: [number, number] = [SNAP_GRID_PX, SNAP_GRID_PX];

export const ALIGN_GUIDE_THRESHOLD_PX = 4;
export const ALIGN_GUIDE_FALLBACK_COLOR = '#4ade80';
export const ALIGN_GUIDE_STROKE_WIDTH = 1;
export const ALIGN_GUIDE_DASH_ARRAY = '4 4';

export const PAN_BUTTONS_ALL: number[] = [0, 1];
export const PAN_BUTTONS_MIDDLE: number[] = [1];

export const EDGE_DEFAULT_STROKE_WIDTH = 1.75;

export const EDGE_CURVATURE = 0.16;

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

export const ELIGIBLE_ACTION_BY_TOOL: Partial<Record<ECanvasTool, TValidationAction>> = {
  [ECanvasTool.ValidPath]: 'valid',
  [ECanvasTool.Answer]: 'answer',
};

export const ARIA_LABEL_KEY_BY_STATUS: Record<TVisibleSaveStatus, 'errorTitle' | 'offline' | 'retrying'> = {
  error: 'errorTitle',
  offline: 'offline',
  retrying: 'retrying',
};

export const FRESH_FIT_PADDING = 0.22;

export const NODE_BAND_TONES: Record<TNodeBandTone, { icon: LucideIcon; color: string }> = {
  question: { icon: HelpCircle, color: 'var(--question)' },
  reference: { icon: Link2, color: 'var(--ref)' },
  answer: { icon: Flag, color: 'var(--decision)' },
  valid: { icon: CheckCircle2, color: 'var(--status-success)' },
  invalid: { icon: XCircle, color: 'var(--status-error)' },
  affected: { icon: AlertTriangle, color: 'var(--status-warning)' },
  open: { icon: CircleDashed, color: 'var(--text-muted)' },
};

export const NODE_ALARM_WASHES: Partial<Record<TNodeBandTone, string>> = {
  invalid: 'color-mix(in srgb, var(--status-error) var(--node-wash), transparent)',
  affected: 'color-mix(in srgb, var(--status-warning) var(--node-wash), transparent)',
};

export const CANVAS_SKELETON_NODES: readonly ICanvasSkeletonNode[] = [
  { id: 'question', x: 50, y: 24, width: 236, lines: 2 },
  { id: 'left', x: 31, y: 50, width: 208, lines: 2 },
  { id: 'right', x: 66, y: 48, width: 196, lines: 1 },
  { id: 'answer', x: 49, y: 72, width: 224, lines: 2 },
];

export const REFERENCE_SKELETON_ROWS: readonly string[] = ['w-40', 'w-28', 'w-36', 'w-24'];
