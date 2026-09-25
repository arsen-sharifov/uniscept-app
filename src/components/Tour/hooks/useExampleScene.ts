'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { TExampleAct, TExampleTarget } from '@interfaces';

import { ECanvasTool } from '@/components/tools';
import { useTranslations } from '@/i18n';
import { event } from '@/lib/events';
import {
  createExampleIds,
  playExampleAct,
  useOnboardingStore,
  waitForExampleCanvas,
  writeExampleQuestion,
} from '@/lib/onboarding';
import { useCanvasStore } from '@/lib/stores';

export const useExampleScene = (
  act: TExampleAct | null,
  stepIndex: number,
  onCreateExample: (name: string) => Promise<string | null>,
  onDeleteExample: (id: string) => Promise<void>,
) => {
  const t = useTranslations();
  const [settledStep, setSettledStep] = useState(-1);
  const playedRef = useRef(new Set<number>());
  const liveRef = useRef(false);
  const threadRef = useRef<string | null>(null);
  const idsRef = useRef<Record<TExampleTarget, string> | null>(null);

  useEffect(() => {
    liveRef.current = true;

    const unsubscribe = useCanvasStore.subscribe((state, previous) => {
      const exampleThreadId = threadRef.current;
      if (!exampleThreadId || previous.threadId !== exampleThreadId || state.threadId === exampleThreadId) return;

      useOnboardingStore.getState().quitRun();
    });

    return () => {
      liveRef.current = false;
      unsubscribe();

      const canvas = useCanvasStore.getState();
      canvas.closeAllOverlays();
      canvas.setActiveTool(ECanvasTool.Select);
    };
  }, []);

  useEffect(() => {
    if (!act || playedRef.current.has(stepIndex)) return;
    playedRef.current.add(stepIndex);

    const copy = { ...t.platform.onboarding.example, placeholder: t.platform.canvas.node.defaultLabel };
    const isLive = () =>
      liveRef.current && (threadRef.current === null || useCanvasStore.getState().threadId === threadRef.current);

    const play = async () => {
      if (act.type !== 'thread') {
        if (idsRef.current) await playExampleAct(act, copy, idsRef.current, isLive);

        return;
      }

      const threadId = await onCreateExample(copy.threadName);
      if (!threadId) {
        useOnboardingStore.getState().quitRun();

        return;
      }

      threadRef.current = threadId;
      idsRef.current = createExampleIds(await waitForExampleCanvas(threadId));
      await writeExampleQuestion(copy, idsRef.current, isLive);
    };

    play()
      .catch((error: unknown) => {
        if (!liveRef.current) {
          event.error(error, { toast: false, context: 'onboarding.example' });

          return;
        }

        event.error(error, { title: t.common.errorTitles.loadFailed, context: 'onboarding.example' });
        useOnboardingStore.getState().quitRun();
      })
      .finally(() => setSettledStep(stepIndex));
  }, [act, stepIndex, onCreateExample, t]);

  const removeExample = useCallback(async () => {
    const threadId = threadRef.current;
    threadRef.current = null;
    if (threadId) await onDeleteExample(threadId);
  }, [onDeleteExample]);

  return { busy: act !== null && settledStep !== stepIndex, removeExample };
};
