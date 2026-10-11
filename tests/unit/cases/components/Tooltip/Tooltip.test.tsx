import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { TRANSLATIONS } from '@mocks/i18n';
import { NonForwardingTrigger, TOOLTIP_HELP_TEXT } from '@mocks/tooltip';
import { Tooltip } from '@/components/Tooltip';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onTriggerFocus = vi.fn();

describe('Tooltip', () => {
  describe('GIVEN a tooltip with the default info trigger', () => {
    beforeEach(() => {
      render(<Tooltip text={TOOLTIP_HELP_TEXT} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the trigger is a named button that keyboard users can reach and that carries the help text', () => {
        const trigger = screen.getByRole('button', { name: TRANSLATIONS.common.moreInfo });

        expect(trigger).toHaveAttribute('type', 'button');
        expect(trigger).toHaveAccessibleDescription(TOOLTIP_HELP_TEXT);
      });
    });
  });

  describe('GIVEN a tooltip whose info trigger has keyboard focus', () => {
    beforeEach(() => {
      render(<Tooltip text={TOOLTIP_HELP_TEXT} />);
      act(() => screen.getByRole('button', { name: TRANSLATIONS.common.moreInfo }).focus());
    });

    describe('WHEN it renders', () => {
      test('THEN the help text shows while the trigger area is hovered or holds focus', () => {
        expect(screen.getByRole('tooltip')).toHaveClass('group-hover:opacity-100', 'group-focus-within:opacity-100');
        expect(screen.getByRole('tooltip').closest('.group')).toContainElement(
          screen.getByRole('button', { name: TRANSLATIONS.common.moreInfo }),
        );
      });
    });

    describe('WHEN Escape is pressed', () => {
      beforeEach(() => {
        fireEvent.keyDown(window, { key: 'Escape' });
      });

      test('THEN the help text hides while focus stays on the trigger', () => {
        expect(screen.getByRole('tooltip')).not.toHaveClass('group-hover:opacity-100');
        expect(screen.getByRole('tooltip')).not.toHaveClass('group-focus-within:opacity-100');
        expect(screen.getByRole('button', { name: TRANSLATIONS.common.moreInfo })).toHaveFocus();
      });
    });

    describe('WHEN Escape is pressed and focus then returns to the trigger', () => {
      beforeEach(() => {
        fireEvent.keyDown(window, { key: 'Escape' });
        act(() => screen.getByRole('button', { name: TRANSLATIONS.common.moreInfo }).blur());
        act(() => screen.getByRole('button', { name: TRANSLATIONS.common.moreInfo }).focus());
      });

      test('THEN the help text shows again', () => {
        expect(screen.getByRole('tooltip')).toHaveClass('group-hover:opacity-100', 'group-focus-within:opacity-100');
      });
    });
  });

  describe('GIVEN a tooltip around a custom trigger with its own focus handler', () => {
    beforeEach(() => {
      render(
        <Tooltip text={TOOLTIP_HELP_TEXT}>
          <button type="button" onFocus={onTriggerFocus}>
            Invite code
          </button>
        </Tooltip>,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN the custom trigger is described by the help text and no extra button appears', () => {
        expect(screen.getByRole('button', { name: 'Invite code' })).toHaveAccessibleDescription(TOOLTIP_HELP_TEXT);
        expect(screen.getAllByRole('button')).toHaveLength(1);
      });
    });

    describe('WHEN the trigger gains focus', () => {
      beforeEach(() => {
        act(() => screen.getByRole('button', { name: 'Invite code' }).focus());
      });

      test('THEN its own focus handler still runs', () => {
        expect(onTriggerFocus).toHaveBeenCalledOnce();
      });
    });

    describe('WHEN Escape is pressed and the pointer then enters the trigger', () => {
      beforeEach(() => {
        fireEvent.keyDown(window, { key: 'Escape' });
        fireEvent.mouseEnter(screen.getByRole('button', { name: 'Invite code' }));
      });

      test('THEN the help text shows again', () => {
        expect(screen.getByRole('tooltip')).toHaveClass('group-hover:opacity-100', 'group-focus-within:opacity-100');
      });
    });
  });

  describe('GIVEN a tooltip around a focused trigger component that does not forward props', () => {
    beforeEach(() => {
      render(
        <Tooltip text={TOOLTIP_HELP_TEXT}>
          <NonForwardingTrigger />
        </Tooltip>,
      );
      act(() => screen.getByRole('button').focus());
    });

    describe('WHEN Escape is pressed and focus then returns to the trigger', () => {
      beforeEach(() => {
        fireEvent.keyDown(window, { key: 'Escape' });
        act(() => screen.getByRole('button').blur());
        act(() => screen.getByRole('button').focus());
      });

      test('THEN the trigger area still brings the help text back', () => {
        expect(screen.getByRole('tooltip')).toHaveClass('group-hover:opacity-100', 'group-focus-within:opacity-100');
        expect(screen.getByRole('tooltip').closest('.group')).toContainElement(screen.getByRole('button'));
      });
    });
  });
});
