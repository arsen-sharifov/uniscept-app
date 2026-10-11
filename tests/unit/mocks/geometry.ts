import type { IAnchorRect } from '@interfaces';

export const VIEW = { width: 800, height: 600 };
export const MENU = { width: 200, height: 120 };

export const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1 };
export const REMEMBERED_VIEWPORT = { x: 120, y: -40, zoom: 1.5 };
export const MOVED_VIEWPORT = { x: 10, y: 20, zoom: 0.8 };

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
export const SCRIM_ANCHOR_RECT: IAnchorRect = { top: 100, left: 200, width: 60, height: 40 };
export const GEOMETRY_ANCHOR_RECT: IAnchorRect = { top: 10, left: 20, width: 30, height: 40 };

export const CANVAS_RECT: IAnchorRect = { top: 0, left: 300, width: 1100, height: 760 };
export const HELP_RECT: IAnchorRect = { top: 820, left: 1380, width: 36, height: 36 };
export const MOVED_RECT: IAnchorRect = { top: 760, left: 1380, width: 36, height: 36 };
export const COVER_RECT: IAnchorRect = { top: 40, left: 150, width: 1240, height: 820 };
export const CREATE_RECT: IAnchorRect = { top: 130, left: 180, width: 90, height: 24 };
export const SWITCHER_RECT: IAnchorRect = { top: 60, left: 10, width: 250, height: 50 };
export const RUN_SWITCHER_RECT: IAnchorRect = { top: 20, left: 16, width: 240, height: 44 };
