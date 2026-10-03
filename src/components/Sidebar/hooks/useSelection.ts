'use client';

import { useCallback, useRef, useState, type MouseEvent } from 'react';

export const useSelection = (validIds?: ReadonlySet<string>) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const lastClickedIdRef = useRef<string | null>(null);

  if (validIds && [...selectedIds].some((id) => !validIds.has(id))) {
    setSelectedIds(new Set([...selectedIds].filter((id) => validIds.has(id))));
  }

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
    lastClickedIdRef.current = id;
  }, []);

  const selectRange = useCallback((targetId: string, orderedItems: readonly { id: string }[]) => {
    const anchorIdx = orderedItems.findIndex((item) => item.id === lastClickedIdRef.current);
    const targetIdx = orderedItems.findIndex((item) => item.id === targetId);
    if (targetIdx === -1) return;
    if (anchorIdx === -1) {
      setSelectedIds(new Set([targetId]));
      lastClickedIdRef.current = targetId;

      return;
    }

    const from = Math.min(anchorIdx, targetIdx);
    const to = Math.max(anchorIdx, targetIdx);
    setSelectedIds(new Set(orderedItems.slice(from, to + 1).map((item) => item.id)));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    lastClickedIdRef.current = null;
  }, []);

  const selectOnClick = useCallback(
    (
      id: string,
      event: Pick<MouseEvent, 'shiftKey' | 'ctrlKey' | 'metaKey'>,
      orderedItems: readonly { id: string }[],
      onActivate?: (id: string) => void,
    ) => {
      if (event.shiftKey) {
        selectRange(id, orderedItems);

        return;
      }
      if (event.ctrlKey || event.metaKey) {
        toggleSelection(id);

        return;
      }
      setSelectedIds(new Set());
      lastClickedIdRef.current = id;
      onActivate?.(id);
    },
    [selectRange, toggleSelection],
  );

  return {
    selectedIds,
    setSelectedIds,
    clearSelection,
    selectOnClick,
    selectionCount: selectedIds.size,
  };
};
