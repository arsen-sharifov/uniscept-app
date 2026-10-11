import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { domRect } from '@mocks/browser';
import { Popover } from '@/components/Popover';

const onOpenChange = vi.fn();

let rerender: (ui: ReactNode) => void;

const withSelfFocusingField = (open: boolean) => (
  <Popover
    open={open}
    onOpenChange={onOpenChange}
    renderTrigger={(trigger) => (
      <button type="button" {...trigger}>
        Workspaces
      </button>
    )}
  >
    <input aria-label="Workspace name" autoFocus />
  </Popover>
);

const aboveTheEnd = (open: boolean) => (
  <Popover
    open={open}
    onOpenChange={onOpenChange}
    placement="top-end"
    renderTrigger={(trigger) => (
      <button type="button" {...trigger}>
        Filters
      </button>
    )}
  >
    <p>Panel</p>
  </Popover>
);

describe('Popover', () => {
  describe('GIVEN a closed popover', () => {
    beforeEach(() => {
      render(
        <Popover
          open={false}
          onOpenChange={onOpenChange}
          renderTrigger={(trigger) => (
            <button type="button" {...trigger}>
              Account
            </button>
          )}
        >
          <p>Panel</p>
        </Popover>,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN the trigger is the only tab stop and announces a collapsed dialog', () => {
        const trigger = screen.getByRole('button', { name: 'Account' });

        expect(screen.getAllByRole('button')).toHaveLength(1);
        expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    describe('WHEN the trigger is clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Account' }));
      });

      test('THEN it asks to open', () => {
        expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);
      });
    });
  });

  describe('GIVEN an open popover', () => {
    beforeEach(() => {
      render(
        <Popover
          open
          onOpenChange={onOpenChange}
          renderTrigger={(trigger) => (
            <button type="button" {...trigger}>
              Account
            </button>
          )}
        >
          <p>Panel</p>
        </Popover>,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN the panel is a focused native dialog anchored below the expanded trigger', () => {
        const dialog = screen.getByRole('dialog');

        expect(dialog.tagName).toBe('DIALOG');
        expect(dialog).toHaveTextContent('Panel');
        expect(dialog).toHaveFocus();
        expect(dialog.style.position).toBe('fixed');
        expect(screen.getByRole('button', { name: 'Account' })).toHaveAttribute('aria-expanded', 'true');
      });

      test('THEN the panel is named after its trigger', () => {
        expect(screen.getByRole('dialog', { name: 'Account' })).toBeInTheDocument();
      });
    });

    describe('WHEN the trigger is clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Account' }));
      });

      test('THEN it asks to close', () => {
        expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
      });
    });

    describe('WHEN the trigger is pressed and released like a real click', () => {
      beforeEach(() => {
        const trigger = screen.getByRole('button', { name: 'Account' });
        fireEvent.mouseDown(trigger);
        fireEvent.click(trigger);
      });

      test('THEN it asks to close once, without the press reopening it', () => {
        expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
      });
    });

    describe('WHEN Escape is pressed', () => {
      beforeEach(() => {
        fireEvent.keyDown(window, { key: 'Escape' });
      });

      test('THEN it asks to close and hands focus back to the trigger', () => {
        expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
        expect(screen.getByRole('button', { name: 'Account' })).toHaveFocus();
      });
    });

    describe('WHEN the pointer goes down inside the panel', () => {
      beforeEach(() => {
        fireEvent.mouseDown(screen.getByText('Panel'));
      });

      test('THEN it stays open', () => {
        expect(onOpenChange).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the pointer goes down outside', () => {
      beforeEach(() => {
        fireEvent.mouseDown(document.body);
      });

      test('THEN it asks to close', () => {
        expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
      });
    });
  });

  describe('GIVEN a popover whose content focuses itself on open', () => {
    beforeEach(() => {
      rerender = render(withSelfFocusingField(false)).rerender;
    });

    describe('WHEN it opens', () => {
      beforeEach(() => {
        rerender(withSelfFocusingField(true));
      });

      test('THEN the content keeps its focus instead of the panel taking it', () => {
        expect(screen.getByRole('textbox', { name: 'Workspace name' })).toHaveFocus();
      });
    });
  });

  describe('GIVEN a popover opened above the end of its trigger', () => {
    beforeEach(() => {
      rerender = render(aboveTheEnd(false)).rerender;
      vi.spyOn(screen.getByRole('button', { name: 'Filters' }), 'getBoundingClientRect').mockReturnValue(
        domRect({ top: 500, bottom: 530, left: 300, right: 400, width: 100, height: 30 }),
      );
      vi.spyOn(HTMLDialogElement.prototype, 'offsetWidth', 'get').mockReturnValue(160);
      rerender(aboveTheEnd(true));
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    describe('WHEN it opens', () => {
      test('THEN the panel sits above the trigger with its right edge on the trigger', () => {
        expect(screen.getByRole('dialog').style).toMatchObject({
          bottom: `${window.innerHeight - 500 + 8}px`,
          top: '',
          left: '240px',
        });
      });
    });

    describe('WHEN the page scrolls and the trigger moves with it', () => {
      beforeEach(() => {
        vi.mocked(screen.getByRole('button', { name: 'Filters' }).getBoundingClientRect).mockReturnValue(
          domRect({ top: 420, bottom: 450, left: 300, right: 400, width: 100, height: 30 }),
        );
        fireEvent.scroll(window);
      });

      test('THEN the panel follows the trigger', () => {
        expect(screen.getByRole('dialog').style.bottom).toBe(`${window.innerHeight - 420 + 8}px`);
      });
    });

    describe('WHEN the window resizes', () => {
      beforeEach(() => {
        fireEvent(window, new Event('resize'));
      });

      test('THEN it asks to close', () => {
        expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
      });
    });
  });
});
