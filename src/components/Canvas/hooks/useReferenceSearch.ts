'use client';

import { useEffect, useMemo, useState } from 'react';

import type { INodeReference } from '@interfaces';
import { searchReferenceTargets } from '@api/client';
import { useCanvasStore } from '@/lib/stores';

interface IUseReferenceSearchInput {
  workspaceId: string;
  threadId: string;
}

export const useReferenceSearch = ({ workspaceId, threadId }: IUseReferenceSearchInput): INodeReference[] => {
  const isPanelOpen = useCanvasStore((s) => s.referenceSearchPosition !== null);
  const [nodes, setNodes] = useState<INodeReference[]>([]);

  useEffect(() => {
    if (!isPanelOpen) return;

    let cancelled = false;

    searchReferenceTargets(workspaceId, threadId)
      .then((results) => {
        if (!cancelled) setNodes(results);
      })
      .catch(() => {
        if (!cancelled) setNodes([]);
      });

    return () => {
      cancelled = true;
    };
  }, [workspaceId, threadId, isPanelOpen]);

  return useMemo(() => (isPanelOpen ? nodes : []), [isPanelOpen, nodes]);
};
