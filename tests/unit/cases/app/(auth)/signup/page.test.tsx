import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { TRANSLATIONS } from '@mocks/i18n';
import SignUpPage from '@/app/(auth)/signup/page';

vi.mock('@api/client', async () => ({
  ...(await import('@mocks/authApi')),
  ...(await import('@mocks/workspaceApi')),
  ...(await import('@mocks/userApi')),
}));
vi.mock('next/navigation', () => import('@mocks/navigation'));
vi.mock('@/i18n', () => import('@mocks/i18n'));

describe('SignUpPage', () => {
  describe('GIVEN a visitor without an account', () => {
    describe('WHEN the sign-up page opens', () => {
      beforeEach(() => {
        render(<SignUpPage />);
      });

      test('THEN the self sign-up flow starts on the plan step with a link back to sign in', () => {
        expect(screen.getByRole('heading', { name: TRANSLATIONS.auth.signUp.planStep.heading })).toBeVisible();
        expect(screen.getByRole('link', { name: TRANSLATIONS.auth.signUp.signInLink })).toHaveAttribute(
          'href',
          '/login',
        );
      });
    });
  });
});
