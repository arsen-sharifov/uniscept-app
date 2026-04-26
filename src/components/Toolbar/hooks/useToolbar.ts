'use client';

import { useCallback, useMemo } from 'react';
import { CANVAS_TOOL_GROUPS, ECanvasTool } from '@/components/tools';
import { useCanvasStore } from '@/lib/stores';

export const useToolbar = () => {
  const activeTool = useCanvasStore((s) => s.activeTool);
  const setActiveTool = useCanvasStore((s) => s.setActiveTool);

  const canUndo = useCanvasStore((s) => s._past.length > 0);
  const canRedo = useCanvasStore((s) => s._future.length > 0);

  const groups = useMemo(
    () =>
      CANVAS_TOOL_GROUPS.map((group) => ({
        ...group,
        tools: group.tools.map((tool) => {
          if (tool.id === ECanvasTool.Undo)
            return { ...tool, disabled: !canUndo };
          if (tool.id === ECanvasTool.Redo)
            return { ...tool, disabled: !canRedo };
          return tool;
        }),
      })),
    [canUndo, canRedo]
  );

  const handleToolClick = useCallback(
    (id: string) => {
      if (id === ECanvasTool.Undo) {
        useCanvasStore.getState().undo();
        return;
      }
      if (id === ECanvasTool.Redo) {
        useCanvasStore.getState().redo();
        return;
      }
      setActiveTool(id as ECanvasTool);
    },
    [setActiveTool]
  );

  return { groups, activeTool, handleToolClick };
};
