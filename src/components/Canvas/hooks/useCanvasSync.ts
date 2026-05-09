'use client';

import { useEffect, useState } from 'react';
import { getCanvasContent } from '@api/client';
import type { ICanvasSnapshot, ISaveState } from '@interfaces';
import {
  enqueueOperation,
  flushNow,
  getSaveState,
  resetQueue,
  subscribeCanvasOperations,
  subscribeSaveState,
} from '@/lib/canvas';
import { createClient } from '@/lib/supabase';
import { useCanvasStore } from '@/lib/stores';

interface ICanvasLoad {
  userId: string | null;
  snapshot: ICanvasSnapshot;
}

interface IUseCanvasSyncResult {
  saveState: ISaveState;
  loadError: Error | null;
}

const loadCanvasFromBackend = async (threadId: string): Promise<ICanvasLoad> => {
  const supabase = createClient();

  const [{ data: userData, error: authError }, snapshot] = await Promise.all([
    supabase.auth.getUser(),
    getCanvasContent(threadId),
  ]);

  if (authError) throw authError;

  return {
    userId: userData.user?.id ?? null,
    snapshot,
  };
};

const toError = (value: unknown): Error => (value instanceof Error ? value : new Error(String(value)));

export const useCanvasSync = (threadId: string): IUseCanvasSyncResult => {
  const [saveState, setSaveState] = useState<ISaveState>(() => getSaveState());
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    return subscribeSaveState(setSaveState);
  }, []);

  useEffect(() => {
    return subscribeCanvasOperations(enqueueOperation);
  }, []);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      const { pendingCount, failedCount } = getSaveState();
      if (pendingCount === 0 && failedCount === 0) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);

    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadCanvasFromBackend(threadId)
      .then(({ userId, snapshot }) => {
        if (cancelled) return;
        useCanvasStore.getState().loadCanvas(threadId, userId, snapshot);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(toError(error));
      });

    return () => {
      cancelled = true;

      flushNow().finally(() => {
        useCanvasStore.getState().clearCanvas();
        resetQueue();
      });
    };
  }, [threadId]);

  return { saveState, loadError };
};
