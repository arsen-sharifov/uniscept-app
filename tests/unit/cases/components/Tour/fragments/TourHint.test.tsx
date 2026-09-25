import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { TTourHint } from '@interfaces';

import { stubResizeObserver } from '@mocks/browser';
import { TRANSLATIONS } from '@mocks/i18n';
import { TourHint } from '@/components/Tour';
import { useOnboardingStore } from '@/lib/onboarding';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const copy = TRANSLATIONS.platform.onboarding.continueHint;

let hint: TTourHint;

beforeEach(() => {
  stubResizeObserver();
});

afterEach(() => useOnboardingStore.getState().forget());

describe('TourHint', () => {
  describe('GIVEN the first run was just finished', () => {
    beforeEach(() => {
      hint = 'afterTour';
      useOnboardingStore.setState({ hint });
    });

    describe('WHEN the pointer shows', () => {
      beforeEach(() => {
        render(<TourHint hint={hint} />);
      });

      test('THEN it invites the user to keep learning from the help menu', () => {
        expect(screen.getByText(copy.afterTour.title)).toBeInTheDocument();
        expect(screen.getByText(copy.afterTour.body)).toBeInTheDocument();
      });
    });

    describe('WHEN the guides are opened from it', () => {
      beforeEach(() => {
        render(<TourHint hint={hint} />);
        fireEvent.click(screen.getByText(copy.open));
      });

      test('THEN the picker opens and the pointer goes away', () => {
        expect(useOnboardingStore.getState()).toMatchObject({ pickerOpen: true, hint: null });
      });
    });
  });

  describe('GIVEN the tour was declined', () => {
    beforeEach(() => {
      hint = 'afterDecline';
      useOnboardingStore.setState({ hint });
    });

    describe('WHEN the pointer shows', () => {
      beforeEach(() => {
        render(<TourHint hint={hint} />);
      });

      test('THEN it says where the tour waits', () => {
        expect(screen.getByText(copy.afterDecline.title)).toBeInTheDocument();
        expect(screen.getByText(copy.afterDecline.body)).toBeInTheDocument();
      });
    });

    describe('WHEN it is dismissed', () => {
      beforeEach(() => {
        render(<TourHint hint={hint} />);
        fireEvent.click(screen.getByText(copy.dismiss));
      });

      test('THEN the pointer goes away without opening anything', () => {
        expect(useOnboardingStore.getState()).toMatchObject({ pickerOpen: false, hint: null });
      });
    });
  });
});
