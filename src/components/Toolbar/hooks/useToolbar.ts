'use client';

import { useCallback, useMemo } from 'react';
import { useStore } from 'zustand';
import type { IToolGroup } from '@interfaces';
import { useTranslations } from '@hooks';
import { ECanvasTool, buildCanvasToolGroups, isCanvasTool } from '@/components/tools';
import { useCanvasStore } from '@/lib/stores';
import { isToolDisabled } from '../utils';

interface IUseToolbarResult {
  groups: IToolGroup[];
  activeTool: ECanvasTool;
  handleToolClick: (id: string) => void;
}

export const useToolbar = (): IUseToolbarResult => {
  const t = useTranslations();
  const storedActiveTool = useCanvasStore((s) => s.activeTool);
  const middlePan = useCanvasStore((s) => s.middlePan);

  const activeTool = middlePan ? ECanvasTool.Pan : storedActiveTool;

  const canUndo = useStore(useCanvasStore.temporal, (state) => state.pastStates.length > 0);
  const canRedo = useStore(useCanvasStore.temporal, (state) => state.futureStates.length > 0);

  const toolsTranslations = t.platform.canvas.tools;
  const baseGroups = useMemo(() => buildCanvasToolGroups(toolsTranslations), [toolsTranslations]);

  const groups = useMemo(
    () =>
      baseGroups.map((group) => ({
        ...group,
        tools: group.tools.map((tool) => ({
          ...tool,
          disabled: isToolDisabled(tool.id, { canUndo, canRedo }),
        })),
      })),
    [baseGroups, canUndo, canRedo]
  );

  const handleToolClick = useCallback((id: string) => {
    const store = useCanvasStore.getState();

    if (id === ECanvasTool.Undo) {
      store.undo();
      return;
    }
    if (id === ECanvasTool.Redo) {
      store.redo();
      return;
    }
    if (!isCanvasTool(id)) return;

    store.setActiveTool(id);
  }, []);

  return { groups, activeTool, handleToolClick };
};
