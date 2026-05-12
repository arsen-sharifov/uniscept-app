import { ECanvasTool } from '@/components';

export const DENSE_DISABLED_TOOL_IDS = new Set<string>([
  ECanvasTool.Pan,
  ECanvasTool.ZoomOut,
  ECanvasTool.Delete,
  ECanvasTool.InvalidPath,
  ECanvasTool.Undo,
  ECanvasTool.Redo,
]);
