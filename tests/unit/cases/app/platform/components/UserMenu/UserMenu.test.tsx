import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { TRANSLATIONS } from '@mocks/i18n';
import { getUser, USER_UNAVAILABLE } from '@mocks/userApi';
import { UserMenu } from '@/app/platform/components/UserMenu';

vi.mock('next/navigation', () => import('@mocks/navigation'));
vi.mock('@api/client', () => import('@mocks/userApi'));
vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/events', () => import('@mocks/events'));

describe('UserMenu', () => {
  describe('GIVEN a failed profile request', () => {
    beforeEach(() => {
      getUser.mockRejectedValue(new Error('Profile unavailable'));
    });

    describe('WHEN the user opens the menu after loading settles', () => {
      beforeEach(async () => {
        await act(async () => {
          render(<UserMenu />);
        });
        fireEvent.click(screen.getByText(TRANSLATIONS.common.userAvatar));
      });

      test('THEN settings and sign out remain available', () => {
        expect(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.title })).toBeEnabled();
        expect(screen.getByRole('button', { name: TRANSLATIONS.platform.sidebar.signOut })).toBeEnabled();
      });
    });
  });

  describe('GIVEN a completed request without a user profile', () => {
    beforeEach(() => {
      getUser.mockResolvedValue(USER_UNAVAILABLE);
    });

    describe('WHEN the user opens the menu', () => {
      beforeEach(async () => {
        await act(async () => {
          render(<UserMenu />);
        });
        fireEvent.click(screen.getByText(TRANSLATIONS.common.userAvatar));
      });

      test('THEN sign out remains available', () => {
        expect(screen.getByRole('button', { name: TRANSLATIONS.platform.sidebar.signOut })).toBeEnabled();
      });
    });
  });
});
