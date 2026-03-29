import { type MeasuringConfiguration, MeasuringStrategy } from '@dnd-kit/core';

export const MAX_DEPTH = 2;
export const INDENTATION_WIDTH = 20;

export const POINTER_ACTIVATION_DISTANCE = 5;

export const FOLDER_INSIDE_THRESHOLD = 0.25;
export const LEAF_SPLIT_THRESHOLD = 0.5;
export const DROP_ZONE_HYSTERESIS_PX = 6;
export const AUTO_EXPAND_DELAY_MS = 500;

export const DRAG_SELECT_ACTIVATION_PX = 5;
export const AUTO_SCROLL_ZONE_PX = 30;
export const AUTO_SCROLL_STEP_PX = 8;
export const AUTO_SCROLL_INTERVAL_MS = 16;

export const DND_MEASURING: MeasuringConfiguration = {
  droppable: { strategy: MeasuringStrategy.WhileDragging },
};
