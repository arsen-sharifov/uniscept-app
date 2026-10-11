import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { TRANSLATIONS } from '@mocks/i18n';
import { useWorldArrival } from '@mocks/landingHooks';
import AuthLayout from '@/app/(auth)/layout';

vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/app/fragments/hooks', () => import('@mocks/landingHooks'));
vi.mock('@/app/fragments/utils', () => import('@mocks/landingUtils'));

describe('AuthLayout', () => {
  describe('GIVEN an auth page', () => {
    beforeEach(() => {
      useWorldArrival.mockReturnValue({ field: true, content: true });
    });

    describe('WHEN it renders inside the auth layout', () => {
      beforeEach(() => {
        render(
          <AuthLayout>
            <h1>Page heading</h1>
          </AuthLayout>,
        );
      });

      test('THEN the logo links home above the product quote and the page content', () => {
        expect(screen.getByRole('link')).toHaveAttribute('href', '/');
        expect(screen.getByText(`“${TRANSLATIONS.auth.aside.quote}”`)).toBeInTheDocument();
        expect(screen.getByText(TRANSLATIONS.auth.aside.tagline)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Page heading' })).toBeInTheDocument();
      });
    });
  });
});
