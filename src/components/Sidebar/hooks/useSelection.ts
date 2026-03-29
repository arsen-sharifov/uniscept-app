'use client';

import { useCallback, useRef, useState } from 'react';

export const useSelection = () => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const lastClickedIdRef = useRef<string | null>(null);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    lastClickedIdRef.current = id;
  }, []);

  const selectRange = useCallback(
    (targetId: string, orderedItems: readonly { id: string }[]) => {
      const anchorId = lastClickedIdRef.current;
      if (!anchorId) {
        setSelectedIds(new Set([targetId]));
        lastClickedIdRef.current = targetId;
        return;
      }

      const anchorIdx = orderedItems.findIndex((item) => item.id === anchorId);
      const targetIdx = orderedItems.findIndex((item) => item.id === targetId);
      if (anchorIdx === -1 || targetIdx === -1) return;

      const from = Math.min(anchorIdx, targetIdx);
      const to = Math.max(anchorIdx, targetIdx);
      setSelectedIds(
        new Set(orderedItems.slice(from, to + 1).map((item) => item.id))
      );
    },
    []
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    lastClickedIdRef.current = null;
  }, []);

  const clearAndSelect = useCallback((id: string) => {
    setSelectedIds(new Set());
    lastClickedIdRef.current = id;
  }, []);

  return {
    selectedIds,
    setSelectedIds,
    toggleSelection,
    selectRange,
    clearSelection,
    clearAndSelect,
    selectionCount: selectedIds.size,
  };
};
