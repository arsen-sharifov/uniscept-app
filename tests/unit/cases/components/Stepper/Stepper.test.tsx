import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { TRANSLATIONS } from '@mocks/i18n';
import { Stepper } from '@/components/Stepper';

vi.mock('@/i18n', () => import('@mocks/i18n'));

describe('Stepper', () => {
  describe('GIVEN three steps with the second one current', () => {
    beforeEach(() => {
      render(<Stepper steps={['Account', 'Profile', 'Invite']} currentStep={2} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the finished step is announced as completed and only the current one is marked', () => {
        const [account, profile, invite] = screen.getAllByRole('listitem');

        expect(within(account!).getByText(TRANSLATIONS.common.completed)).toBeInTheDocument();
        expect(profile).toHaveAttribute('aria-current', 'step');
        expect(profile).toHaveTextContent('2Profile');
        expect(invite).not.toHaveAttribute('aria-current');
        expect(invite).toHaveTextContent('3Invite');
      });
    });
  });
});
