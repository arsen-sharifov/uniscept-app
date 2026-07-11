import type { IToolAvailability } from '@interfaces';

import { ECanvasTool } from '@/components/tools';

export const isToolDisabled = (toolId: string, availability: IToolAvailability): boolean => {
  switch (toolId) {
    case ECanvasTool.Undo:
      return !availability.canUndo;
    case ECanvasTool.Redo:
      return !availability.canRedo;
    case ECanvasTool.AddNode:
    case ECanvasTool.Connect:
    case ECanvasTool.Delete:
    case ECanvasTool.ValidPath:
    case ECanvasTool.InvalidPath:
    case ECanvasTool.Answer:
    case ECanvasTool.CrossReference:
      return !availability.canEditCanvas;
    default:
      return false;
  }
};
