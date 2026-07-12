import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';

import { SELECTION_ITEMS } from '@mocks/sidebar';
import { useSelection } from '@/components/Sidebar/hooks';

let selection: { current: ReturnType<typeof useSelection> };

describe('useSelection', () => {
  describe('GIVEN an empty selection', () => {
    beforeEach(() => {
      selection = renderHook(() => useSelection()).result;
    });

    describe('WHEN an item is toggled', () => {
      beforeEach(() => {
        act(() => selection.current.toggleSelection('b'));
      });

      test('THEN it becomes selected', () => {
        expect(selection.current.selectedIds).toEqual(new Set(['b']));
        expect(selection.current.selectionCount).toBe(1);
      });
    });

    describe('WHEN an item is toggled twice', () => {
      beforeEach(() => {
        act(() => selection.current.toggleSelection('b'));
        act(() => selection.current.toggleSelection('b'));
      });

      test('THEN it is deselected', () => {
        expect(selection.current.selectedIds).toEqual(new Set());
      });
    });

    describe('WHEN two different items are toggled', () => {
      beforeEach(() => {
        act(() => selection.current.toggleSelection('b'));
        act(() => selection.current.toggleSelection('d'));
      });

      test('THEN both stay selected', () => {
        expect(selection.current.selectedIds).toEqual(new Set(['b', 'd']));
        expect(selection.current.selectionCount).toBe(2);
      });
    });

    describe('WHEN a range is selected without an anchor', () => {
      beforeEach(() => {
        act(() => selection.current.selectRange('d', SELECTION_ITEMS));
      });

      test('THEN only the target is selected', () => {
        expect(selection.current.selectedIds).toEqual(new Set(['d']));
      });
    });
  });

  describe('GIVEN an anchored selection', () => {
    beforeEach(() => {
      selection = renderHook(() => useSelection()).result;
      act(() => selection.current.toggleSelection('b'));
    });

    describe('WHEN a forward range is selected', () => {
      beforeEach(() => {
        act(() => selection.current.selectRange('d', SELECTION_ITEMS));
      });

      test('THEN the span between the anchor and the target is selected', () => {
        expect(selection.current.selectedIds).toEqual(new Set(['b', 'c', 'd']));
      });
    });

    describe('WHEN a backward range is selected', () => {
      beforeEach(() => {
        act(() => selection.current.selectRange('a', SELECTION_ITEMS));
      });

      test('THEN the span still covers both directions', () => {
        expect(selection.current.selectedIds).toEqual(new Set(['a', 'b']));
      });
    });

    describe('WHEN a range targets an id missing from the items', () => {
      beforeEach(() => {
        act(() => selection.current.selectRange('missing', SELECTION_ITEMS));
      });

      test('THEN the selection stays unchanged', () => {
        expect(selection.current.selectedIds).toEqual(new Set(['b']));
      });
    });

    describe('WHEN a range starts from an anchor missing from the items', () => {
      beforeEach(() => {
        act(() =>
          selection.current.selectRange(
            'd',
            SELECTION_ITEMS.filter((item) => item.id !== 'b'),
          ),
        );
      });

      test('THEN the selection stays unchanged', () => {
        expect(selection.current.selectedIds).toEqual(new Set(['b']));
      });
    });

    describe('WHEN the anchor item is toggled off before a range', () => {
      beforeEach(() => {
        act(() => selection.current.toggleSelection('b'));
        act(() => selection.current.selectRange('d', SELECTION_ITEMS));
      });

      test('THEN the deselected item still anchors the range', () => {
        expect(selection.current.selectedIds).toEqual(new Set(['b', 'c', 'd']));
      });
    });

    describe('WHEN the selection is cleared', () => {
      beforeEach(() => {
        act(() => selection.current.clearSelection());
        act(() => selection.current.selectRange('d', SELECTION_ITEMS));
      });

      test('THEN the anchor resets too', () => {
        expect(selection.current.selectedIds).toEqual(new Set(['d']));
      });
    });

    describe('WHEN the selection is cleared with a new anchor', () => {
      beforeEach(() => {
        act(() => selection.current.clearAndSetAnchor('c'));
        act(() => selection.current.selectRange('e', SELECTION_ITEMS));
      });

      test('THEN the next range starts from that anchor', () => {
        expect(selection.current.selectedIds).toEqual(new Set(['c', 'd', 'e']));
      });
    });
  });
});
