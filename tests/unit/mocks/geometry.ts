import type { IAnchorRect } from '@interfaces';

export const VIEW = { width: 800, height: 600 };
export const MENU = { width: 200, height: 120 };

export const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1 };
export const REMEMBERED_VIEWPORT = { x: 120, y: -40, zoom: 1.5 };
export const MOVED_VIEWPORT = { x: 10, y: 20, zoom: 0.8 };

export const RESIZED_VIEW = { width: 1000, height: 500 };
export const RECENTERED_VIEWPORT = { x: 220, y: -90, zoom: 1.5 };

export const BROWSER_VIEWPORT = { width: 1440, height: 900 };
export const CARD_SIZE = { width: 300, height: 160 };

export const MENU_WIDTH = 224;
export const MENU_HEIGHT = 96;

export const PANEL_WIDTH = 320;
export const PANEL_HEIGHT = 180;
export const GROWN_PANEL_HEIGHT = 360;

export const FRAME_MS = 16;

export const EDGE_GEOMETRY = { sourceX: 0, sourceY: 0, targetX: 200, targetY: 100 };

export const STEP_CARD_ANCHOR_RECT: IAnchorRect = { top: 120, left: 40, width: 180, height: 32 };
export const PLACEMENT_ANCHOR_RECT: IAnchorRect = { top: 400, left: 700, width: 120, height: 40 };
export const ZOOMED_LAPTOP_VIEWPORT = { width: 683, height: 320 };
export const NARROW_STEP_CARD_SIZE = { width: 340, height: 220 };
export const RIGHT_OF_MIDDLE_ANCHOR_RECT: IAnchorRect = { top: 166, left: 300, width: 102, height: 36 };
export const LEFT_OF_MIDDLE_ANCHOR_RECT: IAnchorRect = { top: 166, left: 280, width: 102, height: 36 };
export const LOW_ANCHOR_RECT: IAnchorRect = { top: 240, left: 250, width: 200, height: 40 };
export const COMPACT_STEP_CARD_SIZE = { width: 287, height: 200 };
export const SCRIM_ANCHOR_RECT: IAnchorRect = { top: 100, left: 200, width: 60, height: 40 };
export const GEOMETRY_ANCHOR_RECT: IAnchorRect = { top: 10, left: 20, width: 30, height: 40 };

export const CANVAS_RECT: IAnchorRect = { top: 0, left: 300, width: 1100, height: 760 };
export const CANVAS_NODE_BELOW_VIEW_RECT: IAnchorRect = { top: 700, left: 600, width: 180, height: 90 };
export const CANVAS_NODE_IN_VIEW_RECT: IAnchorRect = { top: 200, left: 600, width: 180, height: 90 };
export const SIDEBAR_ANCHOR_BELOW_WINDOW_RECT: IAnchorRect = { top: 910, left: 24, width: 20, height: 20 };
export const SIDEBAR_ANCHOR_IN_WINDOW_RECT: IAnchorRect = { top: 300, left: 24, width: 20, height: 20 };
export const TOOL_RAIL_RECT: IAnchorRect = { top: 100, left: 900, width: 56, height: 200 };
export const TOOL_BELOW_RAIL_RECT: IAnchorRect = { top: 360, left: 910, width: 36, height: 36 };
export const TOOL_IN_RAIL_RECT: IAnchorRect = { top: 160, left: 910, width: 36, height: 36 };
export const HELP_RECT: IAnchorRect = { top: 820, left: 1380, width: 36, height: 36 };
export const MOVED_RECT: IAnchorRect = { top: 760, left: 1380, width: 36, height: 36 };
export const COVER_RECT: IAnchorRect = { top: 40, left: 150, width: 1240, height: 820 };
export const CREATE_RECT: IAnchorRect = { top: 130, left: 180, width: 90, height: 24 };
export const SWITCHER_RECT: IAnchorRect = { top: 60, left: 10, width: 250, height: 50 };
export const RUN_SWITCHER_RECT: IAnchorRect = { top: 20, left: 16, width: 240, height: 44 };
