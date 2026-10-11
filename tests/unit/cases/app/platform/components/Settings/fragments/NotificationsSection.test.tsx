import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { TRANSLATIONS } from '@mocks/i18n';
import { NotificationsSection } from '@/app/platform/components/Settings/fragments';

vi.mock('@/i18n', () => import('@mocks/i18n'));

describe('NotificationsSection', () => {
  describe('GIVEN the notifications placeholder', () => {
    beforeEach(() => {
      render(<NotificationsSection />);
    });

    describe('WHEN it renders', () => {
      test('THEN it is marked as coming soon', () => {
        expect(screen.getByText(TRANSLATIONS.platform.settings.comingSoon)).toBeInTheDocument();
      });

      test('THEN every notification switch shows on but stays locked', () => {
        expect(screen.getByRole('switch', { name: TRANSLATIONS.platform.settings.notifications.digest })).toBeChecked();
        expect(screen.getAllByRole('switch', { checked: true })).toHaveLength(4);
        expect(screen.getAllByRole('switch').map((toggle) => toggle.hasAttribute('disabled'))).toEqual([
          true,
          true,
          true,
          true,
        ]);
      });
    });
  });
});
