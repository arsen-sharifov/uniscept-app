'use client';

import { useEffect, useMemo, useState } from 'react';

import type { INodeReference } from '@interfaces';
import { searchReferenceTargets } from '@api/client';
import { useTranslations } from '@/i18n';
import { event } from '@/lib/events';
import { useCanvasStore } from '@/lib/stores';

interface IUseReferenceSearchInput {
  workspaceId: string;
  threadId: string;
}

export const useReferenceSearch = ({ workspaceId, threadId }: IUseReferenceSearchInput): INodeReference[] => {
  const t = useTranslations();
  const isPanelOpen = useCanvasStore((s) => s.referenceSearchPosition !== null);
  const [nodes, setNodes] = useState<INodeReference[]>([]);

  useEffect(() => {
    if (!isPanelOpen) return;

    let cancelled = false;

    searchReferenceTargets(workspaceId, threadId)
      .then((results) => {
        if (!cancelled) setNodes(results);
      })
      .catch((error) => {
        if (cancelled) return;

        setNodes([]);
        event.error(error, { title: t.common.errorTitles.searchFailed, context: 'canvas.referenceSearch' });
      });

    return () => {
      cancelled = true;
    };
  }, [workspaceId, threadId, isPanelOpen, t]);

  return useMemo(() => (isPanelOpen ? nodes : []), [isPanelOpen, nodes]);
};
