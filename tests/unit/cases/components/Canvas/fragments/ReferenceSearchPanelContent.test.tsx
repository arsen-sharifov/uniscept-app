import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { stubResizeObserver } from '@mocks/browser';
import { PANEL_WIDTH, PANEL_HEIGHT, GROWN_PANEL_HEIGHT } from '@mocks/geometry';
import { TRANSLATIONS, translate } from '@mocks/i18n';
import { referenceSearchProps } from '@mocks/referenceSearch';
import { OVERLAY_VIEWPORT_MARGIN } from '@/components/Canvas/consts';
import { ReferenceSearchPanelContent } from '@/components/Canvas/fragments';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onSelect = vi.fn();
const onClose = vi.fn();

let props: ReturnType<typeof referenceSearchProps>;
let resizeObserver: ReturnType<typeof stubResizeObserver>;

const measurePanels = (height: number) => {
  Object.defineProperty(HTMLDialogElement.prototype, 'offsetWidth', { configurable: true, value: PANEL_WIDTH });
  Object.defineProperty(HTMLDialogElement.prototype, 'offsetHeight', { configurable: true, value: height });
};

beforeEach(() => {
  resizeObserver = stubResizeObserver();
  props = referenceSearchProps();
});

afterEach(() => {
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'offsetWidth');
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'offsetHeight');
  vi.unstubAllGlobals();
});

describe('ReferenceSearchPanelContent', () => {
  describe('GIVEN two available targets and a button outside the panel', () => {
    beforeEach(() => {
      render(
        <>
          <button type="button">Outside</button>
          <ReferenceSearchPanelContent {...props} onSelect={onSelect} onClose={onClose} />
        </>,
      );
    });

    describe('WHEN the user selects the second result with the keyboard', () => {
      beforeEach(() => {
        fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
        fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
      });

      test('THEN its source and canvas position are passed to the selection handler once', () => {
        expect(onSelect).toHaveBeenCalledExactlyOnceWith(
          props.position,
          expect.objectContaining({ sourceNodeId: 'r2', sourceThreadId: 'thread-2' }),
        );
      });
    });

    describe('WHEN the user tabs to the second result and presses Enter on it', () => {
      beforeEach(() => {
        const secondResult = within(screen.getAllByRole('option')[1]!).getByRole('button');

        act(() => secondResult.focus());
        fireEvent.keyDown(secondResult, { key: 'Enter' });
      });

      test('THEN the focused result is the one passed to the selection handler', () => {
        expect(onSelect).toHaveBeenCalledExactlyOnceWith(
          props.position,
          expect.objectContaining({ sourceNodeId: 'r2' }),
        );
      });
    });

    describe('WHEN Enter is pressed on a button outside the panel', () => {
      beforeEach(() => {
        fireEvent.keyDown(screen.getByRole('button', { name: 'Outside' }), { key: 'Enter' });
      });

      test('THEN nothing is selected', () => {
        expect(onSelect).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the user moves up from the first result and presses Enter', () => {
      beforeEach(() => {
        fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowUp' });
        fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
      });

      test('THEN the cursor wraps to the last result and selects it', () => {
        expect(onSelect).toHaveBeenCalledExactlyOnceWith(
          props.position,
          expect.objectContaining({ sourceNodeId: 'r2' }),
        );
      });
    });

    describe('WHEN the pointer rests on the second result and Enter is pressed', () => {
      beforeEach(() => {
        fireEvent.mouseEnter(within(screen.getAllByRole('option')[1]!).getByRole('button'));
        fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
      });

      test('THEN the hovered result is the one passed to the selection handler', () => {
        expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true');
        expect(onSelect).toHaveBeenCalledExactlyOnceWith(
          props.position,
          expect.objectContaining({ sourceNodeId: 'r2' }),
        );
      });
    });

    describe('WHEN the user clicks the first result', () => {
      beforeEach(() => {
        fireEvent.click(within(screen.getAllByRole('option')[0]!).getByRole('button'));
      });

      test('THEN that result is passed to the selection handler', () => {
        expect(onSelect).toHaveBeenCalledExactlyOnceWith(
          props.position,
          expect.objectContaining({ sourceNodeId: 'r1', sourceWorkspaceName: 'Workspace one' }),
        );
      });
    });

    describe('WHEN the query names the workspace of the targets', () => {
      beforeEach(() => {
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'workspace one' } });
      });

      test('THEN both targets stay listed', () => {
        expect(screen.getAllByRole('option')).toHaveLength(2);
      });
    });

    describe('WHEN the query matches nothing and Enter is pressed', () => {
      beforeEach(() => {
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'zzz' } });
        fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
        fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
      });

      test('THEN the empty state names the query with a hint and nothing is selected', () => {
        expect(
          screen.getByText(translate('platform.canvas.referenceSearch.noMatch', { query: 'zzz' })),
        ).toBeInTheDocument();
        expect(screen.getByText(TRANSLATIONS.platform.canvas.referenceSearch.hint)).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
        expect(onSelect).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the query changes after moving to the second result', () => {
      beforeEach(() => {
        fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Ref' } });
        fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
      });

      test('THEN selection starts from the first matching result', () => {
        expect(onSelect).toHaveBeenCalledExactlyOnceWith(
          props.position,
          expect.objectContaining({ sourceNodeId: 'r1' }),
        );
      });
    });
  });

  describe('GIVEN no available targets', () => {
    beforeEach(() => {
      render(<ReferenceSearchPanelContent {...props} nodes={[]} onSelect={onSelect} onClose={onClose} />);
    });

    describe('WHEN the panel opens', () => {
      test('THEN it says no nodes were found without a hint', () => {
        expect(screen.getByText(TRANSLATIONS.platform.canvas.referenceSearch.noResults)).toBeInTheDocument();
        expect(screen.queryByText(TRANSLATIONS.platform.canvas.referenceSearch.hint)).not.toBeInTheDocument();
      });
    });

    describe('WHEN the user moves up through the empty list and presses Enter', () => {
      beforeEach(() => {
        fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowUp' });
        fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
      });

      test('THEN nothing is selected', () => {
        expect(onSelect).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN loading restarts while old results remain in props', () => {
    beforeEach(() => {
      const { rerender } = render(<ReferenceSearchPanelContent {...props} onSelect={onSelect} onClose={onClose} />);
      rerender(<ReferenceSearchPanelContent {...props} loading onSelect={onSelect} onClose={onClose} />);
    });

    describe('WHEN the user presses Enter', () => {
      beforeEach(() => {
        fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
      });

      test('THEN stale results cannot be selected or referenced by the combobox', () => {
        expect(onSelect).not.toHaveBeenCalled();
        expect(screen.queryByRole('option')).not.toBeInTheDocument();
        expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-controls');
        expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-activedescendant');
      });
    });
  });

  describe('GIVEN a search requested next to the bottom right corner of the window', () => {
    beforeEach(() => {
      measurePanels(PANEL_HEIGHT);
      render(
        <ReferenceSearchPanelContent
          {...props}
          screenPosition={{ x: window.innerWidth - 40, y: window.innerHeight - 40 }}
          onSelect={onSelect}
          onClose={onClose}
        />,
      );
    });

    describe('WHEN the panel opens', () => {
      test('THEN it moves back inside the window with the edge margin', () => {
        expect(screen.getByRole('dialog')).toHaveStyle({
          left: `${window.innerWidth - PANEL_WIDTH - OVERLAY_VIEWPORT_MARGIN}px`,
          top: `${window.innerHeight - PANEL_HEIGHT - OVERLAY_VIEWPORT_MARGIN}px`,
        });
      });

      test('THEN the search input still takes focus', () => {
        expect(screen.getByRole('combobox')).toHaveFocus();
      });
    });

    describe('WHEN the results make the panel taller', () => {
      beforeEach(() => {
        measurePanels(GROWN_PANEL_HEIGHT);
        resizeObserver.resize();
      });

      test('THEN it moves up again so the taller panel still fits', () => {
        expect(screen.getByRole('dialog')).toHaveStyle({
          top: `${window.innerHeight - GROWN_PANEL_HEIGHT - OVERLAY_VIEWPORT_MARGIN}px`,
        });
      });
    });
  });
});
