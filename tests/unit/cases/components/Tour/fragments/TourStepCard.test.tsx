import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { stubResizeObserver } from '@mocks/browser';
import { STEP_CARD_ANCHOR_RECT } from '@mocks/geometry';
import { TRANSLATIONS } from '@mocks/i18n';
import { ACTION_STEP, READ_STEP, ERGO_STEP } from '@mocks/onboarding';
import { TourStepCard } from '@/components/Tour';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onQuit = vi.fn();
const onNext = vi.fn();

let observer: ReturnType<typeof stubResizeObserver>;

const stepCard = (overrides: Partial<Parameters<typeof TourStepCard>[0]> = {}) => (
  <TourStepCard step={ACTION_STEP} rect={STEP_CARD_ANCHOR_RECT} index={2} total={16} onQuit={onQuit} {...overrides} />
);

const card = (title: string) => screen.getByRole('dialog', { name: title });

const button = (name: string) => screen.queryByRole('button', { name });

beforeEach(() => {
  observer = stubResizeObserver();
  vi.spyOn(HTMLDialogElement.prototype, 'offsetWidth', 'get').mockReturnValue(400);
  vi.spyOn(HTMLDialogElement.prototype, 'offsetHeight', 'get').mockReturnValue(220);
});

describe('TourStepCard', () => {
  describe('GIVEN a step that waits for an action', () => {
    describe('WHEN it is shown', () => {
      beforeEach(() => {
        render(stepCard());
        act(() => observer.resize());
      });

      test('THEN it names the step, counts it, and waits without a next button', () => {
        expect(card(TRANSLATIONS.platform.onboarding.steps.baseThread.title)).toHaveTextContent(
          TRANSLATIONS.platform.onboarding.steps.baseThread.body,
        );
        expect(card(TRANSLATIONS.platform.onboarding.steps.baseThread.title)).toHaveTextContent('step 3 of 16');
        expect(card(TRANSLATIONS.platform.onboarding.steps.baseThread.title)).toHaveTextContent(
          TRANSLATIONS.platform.onboarding.stepWaiting,
        );
        expect(button(TRANSLATIONS.platform.onboarding.stepNext)).not.toBeInTheDocument();
      });
    });

    describe('WHEN the step was already satisfied on arrival', () => {
      beforeEach(() => {
        render(stepCard({ done: true, onNext }));
        act(() => observer.resize());
        fireEvent.click(button(TRANSLATIONS.platform.onboarding.stepNext)!);
      });

      test('THEN it says so and lets the user move on', () => {
        expect(card(TRANSLATIONS.platform.onboarding.steps.baseThread.title)).toHaveTextContent(
          TRANSLATIONS.platform.onboarding.stepDone,
        );
        expect(onNext).toHaveBeenCalledTimes(1);
      });
    });

    describe('WHEN its target is gone', () => {
      beforeEach(() => {
        render(stepCard({ lost: true, rect: null }));
        act(() => observer.resize());
      });

      test('THEN it warns that the target is missing', () => {
        expect(card(TRANSLATIONS.platform.onboarding.steps.baseThread.title)).toHaveTextContent(
          TRANSLATIONS.platform.onboarding.stepLostTarget,
        );
      });
    });

    describe('WHEN something else covers the target', () => {
      beforeEach(() => {
        render(stepCard({ blocked: true, onNext }));
        act(() => observer.resize());
      });

      test('THEN it asks to close the cover instead and offers no next button', () => {
        expect(card(TRANSLATIONS.platform.onboarding.blockedTitle)).toHaveTextContent(
          TRANSLATIONS.platform.onboarding.blockedBody,
        );
        expect(card(TRANSLATIONS.platform.onboarding.blockedTitle)).toHaveTextContent(
          TRANSLATIONS.platform.onboarding.blockedStatus,
        );
        expect(button(TRANSLATIONS.platform.onboarding.stepNext)).not.toBeInTheDocument();
      });
    });

    describe('WHEN the user leaves the tour from it', () => {
      beforeEach(() => {
        render(stepCard());
        act(() => observer.resize());
        fireEvent.click(button(TRANSLATIONS.platform.onboarding.quit)!);
      });

      test('THEN the quit handler runs', () => {
        expect(onQuit).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('GIVEN a step that only explains', () => {
    describe('WHEN it is shown', () => {
      beforeEach(() => {
        render(stepCard({ step: READ_STEP, rect: null, index: 0, onNext }));
        act(() => observer.resize());
      });

      test('THEN it carries no status and moves on with next', () => {
        expect(card(TRANSLATIONS.platform.onboarding.steps.baseIntro.title)).not.toHaveTextContent(
          TRANSLATIONS.platform.onboarding.stepWaiting,
        );
        expect(button(TRANSLATIONS.platform.onboarding.stepNext)).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a scene of the example spoken by the friend', () => {
    describe('WHEN it is shown', () => {
      beforeEach(() => {
        render(stepCard({ step: ERGO_STEP, rect: null, onNext }));
        act(() => observer.resize());
      });

      test('THEN the friend stands in for Nodi and is named before the step counter', () => {
        expect(screen.getByRole('img', { name: TRANSLATIONS.platform.onboarding.ergoAlt })).toBeInTheDocument();
        expect(screen.queryByRole('img', { name: TRANSLATIONS.platform.onboarding.nodiAlt })).not.toBeInTheDocument();
        expect(card(TRANSLATIONS.platform.onboarding.steps.exampleCapsule.title)).toHaveTextContent(
          `${TRANSLATIONS.platform.onboarding.ergoName}/step 3 of 16`,
        );
      });
    });

    describe('WHEN its scene is still playing', () => {
      beforeEach(() => {
        render(stepCard({ step: ERGO_STEP, rect: null, busy: true, onNext }));
        act(() => observer.resize());
      });

      test('THEN next waits for the scene to finish', () => {
        expect(button(TRANSLATIONS.platform.onboarding.stepNext)).toBeDisabled();
      });
    });

    describe('WHEN it brings its own choices', () => {
      beforeEach(() => {
        render(stepCard({ step: ERGO_STEP, rect: null, onNext, actions: <button type="button">choose</button> }));
        act(() => observer.resize());
      });

      test('THEN the choices replace the next button', () => {
        expect(button('choose')).toBeInTheDocument();
        expect(button(TRANSLATIONS.platform.onboarding.stepNext)).not.toBeInTheDocument();
      });
    });
  });
});
