'use client';

import { useEffect, useState } from 'react';
import { searchReferenceTargets } from '@api/client';
import type { IThreadReference } from '@interfaces';
import { useCanvasStore } from '@/lib/stores';

interface IUseReferenceSearchInput {
  workspaceId: string | undefined;
  threadId: string | undefined;
}

export const useReferenceSearch = ({
  workspaceId,
  threadId,
}: IUseReferenceSearchInput) => {
  const referenceSearchPosition = useCanvasStore(
    (s) => s.referenceSearchPosition
  );
  const [threads, setThreads] = useState<IThreadReference[]>([]);

  useEffect(() => {
    if (!workspaceId || !referenceSearchPosition) return;

    let cancelled = false;
    void searchReferenceTargets(workspaceId, threadId).then((results) => {
      if (!cancelled) setThreads(results);
    });

    return () => {
      cancelled = true;
    };
  }, [workspaceId, threadId, referenceSearchPosition]);

  return threads;
};
