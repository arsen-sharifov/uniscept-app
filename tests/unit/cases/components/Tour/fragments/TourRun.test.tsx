import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { ITourSnapshot, TGuideId, TTourStepKey } from '@interfaces';
import { LOST_TARGET_MS } from '@constants';
import { elementAt, stubAnimationFrame, stubPerformanceNow, stubResizeObserver } from '@mocks/browser';
import { RUN_SWITCHER_RECT } from '@mocks/geometry';
import { TRANSLATIONS } from '@mocks/i18n';
import { NO_TOUR_ACCESS, snapshot } from '@mocks/onboarding';
import { TourRun } from '@/components/Tour';
import { findGuide, useOnboardingStore } from '@/lib/onboarding';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const stepIndexOf = (guideId: TGuideId, copyKey: TTourStepKey) =>
  findGuide(guideId)?.steps.findIndex((step) => step.copyKey === copyKey) ?? -1;

const tourRun = (guideId: TGuideId, copyKey: TTourStepKey, state: ITourSnapshot) => (
  <TourRun guide={findGuide(guideId)!} stepIndex={stepIndexOf(guideId, copyKey)} snapshot={state} />
);

const spotlightRing = () => document.querySelector('[data-tour-scrim] rect');

let ring: Element | null;

beforeEach(() => {
  stubResizeObserver();
});

afterEach(() => useOnboardingStore.getState().forget());

describe('TourRun', () => {
  describe('GIVEN a step that waits for a workspace', () => {
    beforeEach(() => {
      useOnboardingStore.setState({ run: { guideId: 'base', stepIndex: stepIndexOf('base', 'baseWorkspace') } });
    });

    describe('WHEN the workspace appears while the step is open', () => {
      beforeEach(() => {
        const { rerender } = render(tourRun('base', 'baseWorkspace', snapshot()));
        rerender(tourRun('base', 'baseWorkspace', snapshot({ workspaceCount: 1 })));
      });

      test('THEN the run moves on by itself', () => {
        expect(useOnboardingStore.getState().run?.stepIndex).toBe(stepIndexOf('base', 'baseWorkspace') + 1);
      });
    });

    describe('WHEN the workspace already exists on arrival', () => {
      beforeEach(() => {
        render(tourRun('base', 'baseWorkspace', snapshot({ workspaceCount: 1 })));
      });

      test('THEN the step waits to be read and offers next', () => {
        expect(useOnboardingStore.getState().run?.stepIndex).toBe(stepIndexOf('base', 'baseWorkspace'));
        expect(screen.getByText(TRANSLATIONS.platform.onboarding.stepNext)).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a step that waits for an open thread', () => {
    let rerender: (ui: ReactNode) => void;

    beforeEach(() => {
      useOnboardingStore.setState({ run: { guideId: 'base', stepIndex: stepIndexOf('base', 'baseThread') } });
      rerender = render(tourRun('base', 'baseThread', snapshot({ workspaceCount: 1, threadId: 'thread-1' }))).rerender;
    });

    describe('WHEN the thread that was open on arrival closes', () => {
      beforeEach(() => {
        rerender(tourRun('base', 'baseThread', snapshot({ workspaceCount: 1 })));
      });

      test('THEN it waits for the action again instead of offering next', () => {
        expect(useOnboardingStore.getState().run?.stepIndex).toBe(stepIndexOf('base', 'baseThread'));
        expect(screen.queryByText(TRANSLATIONS.platform.onboarding.stepNext)).not.toBeInTheDocument();
        expect(screen.getByText(TRANSLATIONS.platform.onboarding.stepWaiting)).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a step the account has no right to perform', () => {
    beforeEach(() => {
      useOnboardingStore.setState({ run: { guideId: 'canvas', stepIndex: stepIndexOf('canvas', 'commentsOpen') } });
    });

    describe('WHEN the run reaches it', () => {
      beforeEach(() => {
        render(tourRun('canvas', 'commentsOpen', snapshot({ threadId: 'thread-1', permissions: NO_TOUR_ACCESS })));
      });

      test('THEN it is skipped', () => {
        expect(useOnboardingStore.getState().run?.stepIndex).toBe(stepIndexOf('canvas', 'commentsOpen') + 1);
      });
    });
  });

  describe('GIVEN a step whose target is on screen', () => {
    beforeEach(() => {
      const frames = stubAnimationFrame();
      document.body.append(elementAt({ 'data-tour': 'sidebarWorkspaceSwitcher' }, RUN_SWITCHER_RECT));
      useOnboardingStore.setState({ run: { guideId: 'base', stepIndex: stepIndexOf('base', 'baseWorkspace') } });
      render(tourRun('base', 'baseWorkspace', snapshot()));
      act(() => frames.flush());
      ring = spotlightRing();
    });

    afterEach(() => {
      document.querySelector('[data-tour="sidebarWorkspaceSwitcher"]')?.remove();
      vi.unstubAllGlobals();
    });

    describe('WHEN the dimmed area around it is pressed', () => {
      beforeEach(() => {
        fireEvent.pointerDown(document.querySelector('[data-tour-scrim]')!);
      });

      test('THEN the ring around the target pulses again', () => {
        expect(spotlightRing()).toBeInTheDocument();
        expect(spotlightRing()).not.toBe(ring);
      });
    });
  });

  describe('GIVEN a canvas step whose thread was closed behind the tour', () => {
    let frames: ReturnType<typeof stubAnimationFrame>;
    let clock: ReturnType<typeof stubPerformanceNow>;

    beforeEach(() => {
      frames = stubAnimationFrame();
      clock = stubPerformanceNow();
      clock.advance(1);
      useOnboardingStore.setState({ run: { guideId: 'base', stepIndex: stepIndexOf('base', 'baseQuestion') } });
      render(tourRun('base', 'baseQuestion', snapshot({ workspaceCount: 1 })));
      act(() => frames.flush());
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    describe('WHEN its target stays missing past the lost delay', () => {
      beforeEach(() => {
        clock.advance(LOST_TARGET_MS);
        act(() => frames.flush());
      });

      test('THEN the run steps back to the step that opens a thread', () => {
        expect(useOnboardingStore.getState().run?.stepIndex).toBe(stepIndexOf('base', 'baseThread'));
      });
    });
  });

  describe('GIVEN a run whose step index is past the end of its guide', () => {
    describe('WHEN it renders', () => {
      beforeEach(() => {
        const guide = findGuide('base')!;
        render(<TourRun guide={guide} stepIndex={guide.steps.length} snapshot={snapshot()} />);
      });

      test('THEN nothing is shown and the run is left alone', () => {
        expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument();
        expect(useOnboardingStore.getState().run).toBeNull();
      });
    });
  });

  describe('GIVEN a running step', () => {
    beforeEach(() => {
      useOnboardingStore.setState({ run: { guideId: 'base', stepIndex: stepIndexOf('base', 'baseIntro') } });
      render(tourRun('base', 'baseIntro', snapshot()));
    });

    describe('WHEN the user leaves the tour', () => {
      beforeEach(() => {
        act(() => screen.getByTitle(TRANSLATIONS.platform.onboarding.quit).click());
      });

      test('THEN the run is dropped and the offer counts as answered', () => {
        expect(useOnboardingStore.getState()).toMatchObject({ run: null, offerAnswered: true });
      });
    });
  });
});
