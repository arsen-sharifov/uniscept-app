import type { IToolAvailability } from '@interfaces';

import { ECanvasTool } from '@/components/tools';

export const isToolDisabled = (toolId: string, availability: IToolAvailability): boolean => {
  switch (toolId) {
    case ECanvasTool.Undo:
      return !availability.canUndo;
    case ECanvasTool.Redo:
      return !availability.canRedo;
    default:
      return false;
  }
};
