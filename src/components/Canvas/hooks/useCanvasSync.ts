'use client';

import { useEffect, useState } from 'react';

import type { ICanvasSnapshot, ISaveState, IUseCanvasSyncResult } from '@interfaces';
import { getCanvasContent } from '@api/client';
import {
  enqueueOperation,
  flushNow,
  getSaveState,
  hasUnsavedChanges,
  resetQueue,
  subscribeCanvasOperations,
  subscribeSaveState,
} from '@/lib/canvas';
import { event } from '@/lib/events';
import { useCanvasStore } from '@/lib/stores';

const LOAD_TIMEOUT_MS = 15000;
const TIMEOUT_ERROR_MESSAGE = 'Request timed out';

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(TIMEOUT_ERROR_MESSAGE)), ms)),
  ]);

const loadCanvasFromBackend = (workspaceId: string, threadId: string): Promise<ICanvasSnapshot> =>
  withTimeout(getCanvasContent(workspaceId, threadId), LOAD_TIMEOUT_MS);

const toError = (value: unknown): Error => (value instanceof Error ? value : new Error(String(value)));

export const useCanvasSync = (workspaceId: string, threadId: string): IUseCanvasSyncResult => {
  const [saveState, setSaveState] = useState<ISaveState>(() => getSaveState());
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => subscribeSaveState(setSaveState), []);

  useEffect(() => subscribeCanvasOperations(enqueueOperation), []);

  useEffect(() => {
    const onBeforeUnload = (beforeUnloadEvent: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) beforeUnloadEvent.preventDefault();
    };

    window.addEventListener('beforeunload', onBeforeUnload);

    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadCanvasFromBackend(workspaceId, threadId)
      .then((snapshot) => {
        if (cancelled) return;
        useCanvasStore.getState().loadCanvas(threadId, snapshot);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(toError(error));
        event.error(error, { toast: false, context: 'canvas.load' });
      });

    return () => {
      cancelled = true;

      flushNow().finally(() => {
        if (useCanvasStore.getState().threadId !== threadId) return;

        useCanvasStore.getState().clearCanvas();
        if (!hasUnsavedChanges()) resetQueue();
      });
    };
  }, [workspaceId, threadId]);

  return { saveState, loadError };
};
