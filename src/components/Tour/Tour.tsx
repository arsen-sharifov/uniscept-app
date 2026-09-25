'use client';

import type { TNavItem } from '@interfaces';

import { EXAMPLE_GUIDE_ID, findGuide, useOnboardingStore } from '@/lib/onboarding';

import { ExampleRun, GuidePicker, TourCelebration, TourHint, TourOffer, TourRun } from './fragments';
import { useOnboarding, useTourSnapshot } from './hooks';

interface ITourProps {
  items: readonly TNavItem[];
  workspaceId: string | null;
  workspaceCount: number;
  threadId: string | null;
  onCreateExample: (name: string) => Promise<string | null>;
  onDeleteExample: (id: string) => Promise<void>;
}

export const Tour = ({
  items,
  workspaceId,
  workspaceCount,
  threadId,
  onCreateExample,
  onDeleteExample,
}: ITourProps) => {
  useOnboarding();

  const loaded = useOnboardingStore((state) => state.loaded);
  const run = useOnboardingStore((state) => state.run);
  const pickerOpen = useOnboardingStore((state) => state.pickerOpen);
  const offerOpen = useOnboardingStore((state) => state.offerOpen);
  const celebrating = useOnboardingStore((state) => state.celebrating);
  const hint = useOnboardingStore((state) => state.hint);

  const snapshot = useTourSnapshot({
    items,
    workspaceId,
    workspaceCount,
    threadId,
    active: run !== null || pickerOpen,
  });
  const guide = run && !pickerOpen && !offerOpen && !celebrating ? findGuide(run.guideId) : null;

  if (!loaded) return null;

  return (
    <>
      <TourOffer />
      <GuidePicker snapshot={snapshot} />
      <TourCelebration />
      {hint && <TourHint hint={hint} />}
      {run &&
        guide &&
        (guide.id === EXAMPLE_GUIDE_ID ? (
          <ExampleRun
            key={guide.id}
            guide={guide}
            stepIndex={run.stepIndex}
            snapshot={snapshot}
            onCreateExample={onCreateExample}
            onDeleteExample={onDeleteExample}
          />
        ) : (
          <TourRun key={guide.id} guide={guide} stepIndex={run.stepIndex} snapshot={snapshot} />
        ))}
    </>
  );
};
