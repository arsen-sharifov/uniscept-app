import type { IToolAvailability } from '@interfaces';

export const FULL_AVAILABILITY: IToolAvailability = { canUndo: true, canRedo: true, canEditCanvas: true };
export const NO_HISTORY_AVAILABILITY: IToolAvailability = { canUndo: false, canRedo: false, canEditCanvas: true };
export const READONLY_AVAILABILITY: IToolAvailability = { canUndo: true, canRedo: true, canEditCanvas: false };
export const NO_AVAILABILITY: IToolAvailability = { canUndo: false, canRedo: false, canEditCanvas: false };
