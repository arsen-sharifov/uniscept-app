import type { User } from '@supabase/supabase-js';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { TRANSLATIONS } from '@mocks/i18n';
import { PlanSection } from '@/app/platform/components/Settings/fragments';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const userOnPlan = (plan: string) => ({ id: 'user-1', user_metadata: { plan } }) as unknown as User;

const currentCard = () => screen.getByText(TRANSLATIONS.platform.settings.plan.current).closest('article')!;

describe('PlanSection', () => {
  describe('GIVEN a beta account without a stored plan', () => {
    beforeEach(() => {
      render(<PlanSection user={null} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the free Demo plan is marked as the current one', () => {
        expect(within(currentCard()).getByText(TRANSLATIONS.landing.pricing.plans.demo.name)).toBeInTheDocument();
        expect(within(currentCard()).getByText(TRANSLATIONS.platform.settings.plan.free)).toBeInTheDocument();
      });

      test('THEN the paid plans are locked as coming soon with their monthly price', () => {
        expect(screen.getAllByText(TRANSLATIONS.platform.settings.plan.lockedBadge)).toHaveLength(3);
        expect(screen.getByText('$20')).toBeInTheDocument();
        expect(screen.getAllByText(`/${TRANSLATIONS.landing.pricing.periods.month}`)).toHaveLength(3);
      });
    });
  });

  describe('GIVEN an account on the Pro plan', () => {
    beforeEach(() => {
      render(<PlanSection user={userOnPlan('pro')} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the Pro plan is current instead of the locked badge', () => {
        expect(within(currentCard()).getByText(TRANSLATIONS.landing.pricing.plans.pro.name)).toBeInTheDocument();
        expect(
          within(currentCard()).queryByText(TRANSLATIONS.platform.settings.plan.lockedBadge),
        ).not.toBeInTheDocument();
        expect(screen.getAllByText(TRANSLATIONS.platform.settings.plan.lockedBadge)).toHaveLength(2);
      });
    });
  });
});
