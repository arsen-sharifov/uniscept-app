import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { TRANSLATIONS } from '@mocks/i18n';
import { Tooltip } from '@/components/Tooltip';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const HELP = 'Required during closed beta.';

describe('Tooltip', () => {
  describe('GIVEN a tooltip with the default info trigger', () => {
    beforeEach(() => {
      render(<Tooltip text={HELP} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the trigger is a named button that keyboard users can reach and that carries the help text', () => {
        const trigger = screen.getByRole('button', { name: TRANSLATIONS.common.moreInfo });

        expect(trigger).toHaveAttribute('type', 'button');
        expect(trigger).toHaveAccessibleDescription(HELP);
      });
    });
  });

  describe('GIVEN a tooltip around a custom trigger', () => {
    beforeEach(() => {
      render(
        <Tooltip text={HELP}>
          <button type="button">Invite code</button>
        </Tooltip>,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN the custom trigger is described by the help text and no extra button appears', () => {
        expect(screen.getByRole('button', { name: 'Invite code' })).toHaveAccessibleDescription(HELP);
        expect(screen.getAllByRole('button')).toHaveLength(1);
      });
    });
  });
});
