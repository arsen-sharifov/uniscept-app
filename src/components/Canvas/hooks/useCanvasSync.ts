'use client';

import { useEffect, useState } from 'react';
import { getCanvasContent } from '@api/client';
import { useCanvasStore } from '@/lib/stores';
import {
  enqueueOp,
  flushNow,
  getSaveState,
  resetQueue,
  subscribeCanvasOps,
  subscribeSaveState,
  type ISaveState,
} from '../sync';

/**
 * Loads canvas content for `threadId`, wires the store-emitted ops into the
 * persistence queue, and flushes pending changes on unmount / thread switch.
 *
 * The store stays free of any API knowledge — every mutation it performs emits
 * a discrete op (see ops.ts), which this hook routes into the sync queue.
 */
export const useCanvasSync = (threadId: string | undefined) => {
  const [saveState, setSaveState] = useState<ISaveState>(() => getSaveState());

  useEffect(() => subscribeSaveState(setSaveState), []);

  useEffect(() => {
    const unsubscribe = subscribeCanvasOps(enqueueOp);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!threadId) {
      useCanvasStore.getState().clearCanvas();
      resetQueue();
      return;
    }

    let cancelled = false;
    const run = async () => {
      const snapshot = await getCanvasContent(threadId);
      if (cancelled) return;
      useCanvasStore.getState().loadCanvas(threadId, snapshot);
    };

    void run();

    return () => {
      cancelled = true;
      void flushNow().finally(() => {
        useCanvasStore.getState().clearCanvas();
        resetQueue();
      });
    };
  }, [threadId]);

  return saveState;
};
