import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { referenceSearchProps } from '@mocks/referenceSearch';
import { ReferenceSearchPanelContent } from '@/components/Canvas/fragments';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onSelect = vi.fn();
const onClose = vi.fn();

let props: ReturnType<typeof referenceSearchProps>;

beforeEach(() => {
  props = referenceSearchProps();
});

describe('ReferenceSearchPanelContent', () => {
  describe('GIVEN two available targets', () => {
    beforeEach(() => {
      render(<ReferenceSearchPanelContent {...props} onSelect={onSelect} onClose={onClose} />);
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
});
