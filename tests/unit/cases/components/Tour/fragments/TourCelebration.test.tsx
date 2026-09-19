import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { TRANSLATIONS } from '@mocks/i18n';
import { TourCelebration } from '@/components/Tour';
import { useOnboardingStore } from '@/lib/onboarding';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const copy = TRANSLATIONS.platform.onboarding;

const badges = TRANSLATIONS.platform.settings.profile.badges;

afterEach(() => useOnboardingStore.getState().forget());

describe('TourCelebration', () => {
  describe('GIVEN the user finished every guide for the first time', () => {
    beforeEach(() => {
      useOnboardingStore.setState({ celebrating: true });
    });

    describe('WHEN the celebration shows', () => {
      beforeEach(() => {
        render(<TourCelebration />);
      });

      test('THEN it congratulates the user and shows the earned Initiate badge', () => {
        expect(screen.getByRole('heading', { name: copy.celebrationTitle })).toBeInTheDocument();
        expect(screen.getByText(copy.celebrationBody)).toBeInTheDocument();
        expect(screen.getByRole('img', { name: badges.badgeInitiate })).toBeInTheDocument();
      });
    });

    describe('WHEN the user heads back to work', () => {
      beforeEach(() => {
        render(<TourCelebration />);
        fireEvent.click(screen.getByRole('button', { name: copy.celebrationClose }));
      });

      test('THEN the celebration closes', () => {
        expect(useOnboardingStore.getState().celebrating).toBe(false);
      });
    });

    describe('WHEN it is dismissed with Escape', () => {
      beforeEach(() => {
        render(<TourCelebration />);
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      test('THEN the celebration closes as well', () => {
        expect(useOnboardingStore.getState().celebrating).toBe(false);
      });
    });
  });

  describe('GIVEN nothing to celebrate', () => {
    describe('WHEN the platform renders', () => {
      beforeEach(() => {
        render(<TourCelebration />);
      });

      test('THEN no celebration is shown', () => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });
});
