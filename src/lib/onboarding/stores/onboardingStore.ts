'use client';

import { create } from 'zustand';

import type { IOnboardingProgress, ITourRun, TGuideId, TTourHint, TTourSignal } from '@interfaces';

import { dismissOverlays } from '../anchors';
import { findGuide, hasEarnedBadge, isFirstRun } from '../guides';

interface IOnboardingState {
  loaded: boolean;
  userId: string | null;
  offerAnswered: boolean;
  completedGuides: TGuideId[];
  offerOpen: boolean;
  pickerOpen: boolean;
  celebrating: boolean;
  run: ITourRun | null;
  signals: ReadonlySet<TTourSignal>;
  hint: TTourHint | null;
}

interface IOnboardingStore extends IOnboardingState {
  hydrate: (userId: string | null, progress: IOnboardingProgress | null) => void;
  forget: () => void;
  answerOffer: () => void;
  openOffer: () => void;
  openPicker: () => void;
  closePicker: () => void;
  startGuide: (guideId: TGuideId) => void;
  advance: () => void;
  rewind: () => void;
  quitRun: () => void;
  closeCelebration: () => void;
  dismissHint: () => void;
  markSignal: (signal: TTourSignal) => void;
}

const NO_SIGNALS: ReadonlySet<TTourSignal> = new Set();

const INITIAL_STATE: IOnboardingState = {
  loaded: false,
  userId: null,
  offerAnswered: false,
  completedGuides: [],
  offerOpen: false,
  pickerOpen: false,
  celebrating: false,
  run: null,
  signals: NO_SIGNALS,
  hint: null,
};

export const useOnboardingStore = create<IOnboardingStore>((set, get) => ({
  ...INITIAL_STATE,

  hydrate: (userId, progress) =>
    set((state) => {
      const returning = userId !== null && state.userId === userId;
      const offerAnswered = (returning && state.offerAnswered) || (progress?.offerAnswered ?? false);
      const stored = progress?.completedGuides ?? [];
      const kept = returning ? state.completedGuides : [];

      return {
        loaded: true,
        userId,
        offerAnswered,
        completedGuides: [...kept, ...stored.filter((guideId) => !kept.includes(guideId))],
        offerOpen: !offerAnswered,
        run: returning ? state.run : null,
        pickerOpen: returning && state.pickerOpen,
        celebrating: returning && state.celebrating,
        signals: returning ? state.signals : NO_SIGNALS,
        hint: returning ? state.hint : null,
      };
    }),

  forget: () => set(INITIAL_STATE),

  answerOffer: () => set({ offerAnswered: true, offerOpen: false, hint: 'afterDecline' }),

  openOffer: () => {
    dismissOverlays();
    set({ offerOpen: true, pickerOpen: false, run: null, hint: null });
  },

  openPicker: () => {
    dismissOverlays();
    set({ pickerOpen: true, offerOpen: false, run: null, hint: null });
  },

  closePicker: () => set({ pickerOpen: false }),

  startGuide: (guideId) => {
    dismissOverlays();
    set({
      run: { guideId, stepIndex: 0 },
      offerAnswered: true,
      offerOpen: false,
      pickerOpen: false,
      signals: NO_SIGNALS,
      hint: null,
    });
  },

  advance: () => {
    const { run, completedGuides } = get();
    if (!run) return;

    const guide = findGuide(run.guideId);
    if (!guide) return;

    const nextIndex = run.stepIndex + 1;

    if (nextIndex < guide.steps.length) {
      set({ run: { guideId: run.guideId, stepIndex: nextIndex } });

      return;
    }

    const nextCompleted = completedGuides.includes(run.guideId) ? completedGuides : [...completedGuides, run.guideId];
    const earned = hasEarnedBadge(nextCompleted) && !hasEarnedBadge(completedGuides);
    const firstRunDone = isFirstRun(run, completedGuides) && !earned;

    dismissOverlays();

    set({
      run: null,
      completedGuides: nextCompleted,
      celebrating: earned,
      pickerOpen: !earned && !firstRunDone,
      hint: firstRunDone ? 'afterTour' : null,
    });
  },

  rewind: () => {
    const { run } = get();
    if (!run || run.stepIndex === 0) return;

    set({ run: { guideId: run.guideId, stepIndex: run.stepIndex - 1 } });
  },

  quitRun: () =>
    set((state) => ({
      run: null,
      offerAnswered: true,
      offerOpen: false,
      hint: isFirstRun(state.run, state.completedGuides) ? 'afterDecline' : state.hint,
    })),

  closeCelebration: () => set({ celebrating: false }),

  dismissHint: () => set({ hint: null }),

  markSignal: (signal) =>
    set((state) => (state.run && !state.signals.has(signal) ? { signals: new Set(state.signals).add(signal) } : state)),
}));
