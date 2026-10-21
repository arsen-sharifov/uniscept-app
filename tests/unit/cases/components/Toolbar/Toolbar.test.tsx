import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { domRect } from '@mocks/browser';
import { TRANSLATIONS } from '@mocks/i18n';
import { TEXT_SHORTCUT_GROUP, TOOL_GROUPS } from '@mocks/toolbar';
import { Toolbar } from '@/components/Toolbar';
import { TOOLTIP_DELAY_MS } from '@/components/Toolbar/consts';
import { useOnboardingStore } from '@/lib/onboarding';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onToolClick = vi.fn();

const helpButton = () => screen.getByRole('button', { name: TRANSLATIONS.platform.onboarding.menuLabel });

beforeEach(() => {
  useOnboardingStore.setState({ offerOpen: false, pickerOpen: false, run: null, hint: null });
});

afterEach(() => {
  useOnboardingStore.getState().forget();
  vi.useRealTimers();
});

describe('Toolbar', () => {
  describe('GIVEN a toolbar without tool groups', () => {
    beforeEach(() => {
      render(<Toolbar groups={[]} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the help section draws no divider above it', () => {
        expect(helpButton().closest('div.mx-2')).not.toHaveClass('border-t');
      });
    });
  });

  describe('GIVEN a toolbar with tool groups', () => {
    beforeEach(() => {
      render(<Toolbar groups={[{ id: 'navigate', label: 'Navigate', tools: [] }]} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the help section is divided from the tools', () => {
        expect(helpButton().closest('div.mx-2')).toHaveClass('border-t');
      });
    });
  });

  describe('GIVEN tool groups and separate shortcut groups', () => {
    beforeEach(() => {
      render(<Toolbar groups={TOOL_GROUPS} shortcutGroups={[...TOOL_GROUPS, TEXT_SHORTCUT_GROUP]} />);
      fireEvent.click(helpButton(), { detail: 1 });
      fireEvent.click(screen.getByRole('menuitem', { name: TRANSLATIONS.platform.onboarding.menuShortcuts }));
    });

    describe('WHEN the shortcuts sheet opens', () => {
      test('THEN it lists the shortcut groups including text formatting', () => {
        expect(screen.getByRole('dialog')).toHaveTextContent(TEXT_SHORTCUT_GROUP.label ?? '');
        expect(screen.getByRole('dialog')).toHaveTextContent('Bold');
      });
    });
  });

  describe('GIVEN the shortcuts sheet opened from the help menu', () => {
    beforeEach(() => {
      render(<Toolbar />);
      fireEvent.click(helpButton(), { detail: 1 });
      fireEvent.click(screen.getByRole('menuitem', { name: TRANSLATIONS.platform.onboarding.menuShortcuts }));
    });

    describe('WHEN the sheet opens', () => {
      test('THEN it takes focus from the closed menu', () => {
        expect(
          screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.shortcuts.closeAriaLabel }),
        ).toHaveFocus();
      });
    });

    describe('WHEN the sheet is closed with Escape', () => {
      beforeEach(() => {
        fireEvent.keyDown(window, { key: 'Escape' });
      });

      test('THEN focus returns to the help button', () => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(helpButton()).toHaveFocus();
      });
    });
  });

  describe('GIVEN a toolbar with two tool groups', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(domRect({ top: 100, height: 36 }));
      render(<Toolbar groups={TOOL_GROUPS} activeTool="pan" onToolClick={onToolClick} />);
    });

    describe('WHEN the pointer rests on a tool for less than the delay', () => {
      beforeEach(() => {
        fireEvent.pointerEnter(screen.getByRole('button', { name: 'Pan' }));
        act(() => vi.advanceTimersByTime(TOOLTIP_DELAY_MS - 1));
      });

      test('THEN no tooltip shows yet', () => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    describe('WHEN the pointer rests on a tool past the delay', () => {
      beforeEach(() => {
        fireEvent.pointerEnter(screen.getByRole('button', { name: 'Pan' }));
        act(() => vi.advanceTimersByTime(TOOLTIP_DELAY_MS));
      });

      test('THEN the tooltip names the tool and its key next to the middle of the button', () => {
        expect(screen.getByRole('tooltip')).toHaveTextContent('PanH');
        expect(screen.getByRole('tooltip')).toHaveStyle({ top: '118px' });
      });
    });

    describe('WHEN the pointer moves on to the next tool once the tooltip shows', () => {
      beforeEach(() => {
        fireEvent.pointerEnter(screen.getByRole('button', { name: 'Pan' }));
        act(() => vi.advanceTimersByTime(TOOLTIP_DELAY_MS));
        fireEvent.pointerLeave(screen.getByRole('button', { name: 'Pan' }));
        fireEvent.pointerEnter(screen.getByRole('button', { name: 'Zoom in' }));
      });

      test('THEN the tooltip waits for the delay again', () => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    describe('WHEN the pointer enters another tool while the tooltip shows for the focused one', () => {
      beforeEach(() => {
        fireEvent.focus(screen.getByRole('button', { name: 'Pan' }));
        act(() => vi.advanceTimersByTime(TOOLTIP_DELAY_MS));
        fireEvent.pointerEnter(screen.getByRole('button', { name: 'Zoom in' }));
      });

      test('THEN the tooltip switches to the next tool at once', () => {
        expect(screen.getByRole('tooltip')).toHaveTextContent('Zoom in+');
      });
    });

    describe('WHEN the pointer leaves the toolbar once the tooltip shows', () => {
      beforeEach(() => {
        fireEvent.pointerEnter(screen.getByRole('button', { name: 'Pan' }));
        act(() => vi.advanceTimersByTime(TOOLTIP_DELAY_MS));
        fireEvent.mouseLeave(screen.getByRole('complementary', { name: TRANSLATIONS.platform.canvas.tools.ariaLabel }));
      });

      test('THEN the tooltip hides', () => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    describe('WHEN the pointer leaves a tool before the delay', () => {
      beforeEach(() => {
        fireEvent.pointerEnter(screen.getByRole('button', { name: 'Pan' }));
        fireEvent.pointerLeave(screen.getByRole('button', { name: 'Pan' }));
        act(() => vi.advanceTimersByTime(TOOLTIP_DELAY_MS));
      });

      test('THEN no tooltip shows', () => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    describe('WHEN a tool is clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
      });

      test('THEN the click is reported with the tool id', () => {
        expect(onToolClick).toHaveBeenCalledExactlyOnceWith('zoom-in');
      });
    });

    describe("WHEN '?' is pressed", () => {
      beforeEach(() => {
        fireEvent.keyDown(window, { key: '?' });
      });

      test('THEN the shortcuts sheet opens', () => {
        expect(
          screen.getByRole('dialog', { name: TRANSLATIONS.platform.canvas.shortcuts.ariaLabel }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a toolbar of a named thread whose tools are still loading', () => {
    beforeEach(() => {
      render(<Toolbar threadId="thread-1" threadName="Thread" groups={TOOL_GROUPS} pendingGroups={TOOL_GROUPS} />);
    });

    describe('WHEN it renders', () => {
      test('THEN neither the tools nor the export and help menus are offered yet', () => {
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a toolbar of a named thread', () => {
    beforeEach(() => {
      render(<Toolbar threadId="thread-1" threadName="Thread" groups={[]} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the export menu sits above the help menu', () => {
        expect(screen.getAllByRole('button').map((button) => button.getAttribute('aria-label'))).toEqual([
          TRANSLATIONS.platform.canvas.export.label,
          TRANSLATIONS.platform.onboarding.menuLabel,
        ]);
      });
    });
  });
});
