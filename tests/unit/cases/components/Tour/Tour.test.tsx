import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { getCurrentUserId } from '@mocks/authApi';
import { stubAnimationFrame, stubResizeObserver } from '@mocks/browser';
import { TRANSLATIONS } from '@mocks/i18n';
import { BASE_STEP, SECOND_BASE_STEP, EXAMPLE_LAST_INDEX } from '@mocks/onboarding';
import { getOnboarding } from '@mocks/onboardingApi';
import { Tour } from '@/components/Tour';
import { EXAMPLE_GUIDE_ID, useOnboardingStore } from '@/lib/onboarding';

vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@api/client', async () => ({
  ...(await import('@mocks/authApi')),
  ...(await import('@mocks/onboardingApi')),
}));

const onCreateExample = vi.fn();
const onDeleteExample = vi.fn();

let observer: ReturnType<typeof stubResizeObserver>;

const tour = (
  <Tour
    items={[]}
    workspaceId={null}
    workspaceCount={0}
    threadId={null}
    onCreateExample={onCreateExample}
    onDeleteExample={onDeleteExample}
  />
);

beforeEach(() => {
  stubAnimationFrame();
  observer = stubResizeObserver();
  getCurrentUserId.mockReturnValue(new Promise(() => {}));
  getOnboarding.mockReturnValue(new Promise(() => {}));
});

afterEach(() => {
  useOnboardingStore.getState().forget();
  vi.unstubAllGlobals();
});

describe('Tour', () => {
  describe('GIVEN progress that is still loading and a run in the store', () => {
    beforeEach(() => {
      useOnboardingStore.setState({ run: { guideId: 'base', stepIndex: 0 } });
    });

    describe('WHEN it renders', () => {
      beforeEach(() => {
        render(tour);
      });

      test('THEN nothing is shown yet', () => {
        expect(
          screen.queryByText(TRANSLATIONS.platform.onboarding.steps[BASE_STEP.copyKey].title),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN loaded progress with a run of a regular guide', () => {
    beforeEach(() => {
      vi.spyOn(HTMLDialogElement.prototype, 'offsetWidth', 'get').mockReturnValue(400);
      useOnboardingStore.setState({ loaded: true, offerAnswered: true, run: { guideId: 'base', stepIndex: 0 } });
      render(tour);
      act(() => observer.resize());
    });

    describe('WHEN it renders', () => {
      test('THEN the step of that guide is shown', () => {
        expect(screen.getByText(TRANSLATIONS.platform.onboarding.steps[BASE_STEP.copyKey].title)).toBeInTheDocument();
      });
    });

    describe('WHEN next is pressed', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.onboarding.stepNext }));
      });

      test('THEN the following step of the guide takes its place', () => {
        expect(
          screen.getByText(TRANSLATIONS.platform.onboarding.steps[SECOND_BASE_STEP.copyKey].title),
        ).toBeInTheDocument();
        expect(
          screen.queryByText(TRANSLATIONS.platform.onboarding.steps[BASE_STEP.copyKey].title),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN loaded progress with the example run on its last scene', () => {
    beforeEach(() => {
      useOnboardingStore.setState({
        loaded: true,
        offerAnswered: true,
        run: { guideId: EXAMPLE_GUIDE_ID, stepIndex: EXAMPLE_LAST_INDEX },
      });
    });

    describe('WHEN it renders', () => {
      beforeEach(() => {
        render(tour);
      });

      test('THEN the example scene asks what to do with the example', () => {
        expect(screen.getByText(TRANSLATIONS.platform.onboarding.example.keep)).toBeInTheDocument();
        expect(screen.getByText(TRANSLATIONS.platform.onboarding.example.remove)).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN loaded progress with a run behind the open guide picker', () => {
    beforeEach(() => {
      useOnboardingStore.setState({
        loaded: true,
        offerAnswered: true,
        pickerOpen: true,
        run: { guideId: 'base', stepIndex: 0 },
      });
    });

    describe('WHEN it renders', () => {
      beforeEach(() => {
        render(tour);
      });

      test('THEN only the picker is shown', () => {
        expect(screen.getByRole('dialog', { name: TRANSLATIONS.platform.onboarding.pickerTitle })).toBeInTheDocument();
        expect(
          screen.queryByText(TRANSLATIONS.platform.onboarding.steps[BASE_STEP.copyKey].title),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN loaded progress with a pending hint', () => {
    beforeEach(() => {
      useOnboardingStore.setState({ loaded: true, offerAnswered: true, hint: 'afterTour' });
    });

    describe('WHEN it renders', () => {
      beforeEach(() => {
        render(tour);
      });

      test('THEN the hint is shown', () => {
        expect(screen.getByText(TRANSLATIONS.platform.onboarding.continueHint.afterTour.title)).toBeInTheDocument();
      });
    });
  });
});
