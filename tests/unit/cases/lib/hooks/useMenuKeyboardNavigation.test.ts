import { renderHook } from '@testing-library/react';
import type { KeyboardEvent } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useMenuKeyboardNavigation } from '@hooks';

const menu = document.createElement('div');
const items = ['first', 'second', 'third'].map((label) => {
  const item = document.createElement('button');
  item.setAttribute('role', 'menuitem');
  item.textContent = label;

  return item;
});

menu.append(...items);

let navigation: ReturnType<typeof useMenuKeyboardNavigation>;
let preventDefault: ReturnType<typeof vi.fn>;

const press = (key: string) => {
  preventDefault = vi.fn();
  navigation.handleKeyDown({ key, preventDefault } as unknown as KeyboardEvent<HTMLElement>);
};

beforeEach(() => {
  document.body.append(menu);
  navigation = renderHook(() => useMenuKeyboardNavigation({ current: menu })).result.current;
});

afterEach(() => {
  menu.remove();
});

describe('useMenuKeyboardNavigation', () => {
  describe('GIVEN a menu with three items', () => {
    describe('WHEN the first item is focused through the hook', () => {
      beforeEach(() => {
        navigation.focusItem(0);
      });

      test('THEN only that item stays in the tab order', () => {
        expect(document.activeElement).toBe(items[0]);
        expect(items.map((item) => item.tabIndex)).toEqual([0, -1, -1]);
      });
    });

    describe('WHEN ArrowDown is pressed on the first item', () => {
      beforeEach(() => {
        navigation.focusItem(0);
        press('ArrowDown');
      });

      test('THEN focus moves to the next item and the key is consumed', () => {
        expect(document.activeElement).toBe(items[1]);
        expect(preventDefault).toHaveBeenCalledTimes(1);
      });
    });

    describe('WHEN ArrowUp is pressed on the first item', () => {
      beforeEach(() => {
        navigation.focusItem(0);
        press('ArrowUp');
      });

      test('THEN focus wraps to the last item', () => {
        expect(document.activeElement).toBe(items[2]);
      });
    });

    describe('WHEN End and then Home are pressed', () => {
      beforeEach(() => {
        navigation.focusItem(1);
        press('End');
        press('Home');
      });

      test('THEN focus lands on the first item', () => {
        expect(document.activeElement).toBe(items[0]);
      });
    });

    describe('WHEN an unrelated key is pressed', () => {
      beforeEach(() => {
        navigation.focusItem(0);
        press('Tab');
      });

      test('THEN focus stays put and the key is left alone', () => {
        expect(document.activeElement).toBe(items[0]);
        expect(preventDefault).not.toHaveBeenCalled();
      });
    });

    describe('WHEN ArrowUp is pressed while nothing is focused', () => {
      beforeEach(() => {
        press('ArrowUp');
      });

      test('THEN focus starts from the last item', () => {
        expect(document.activeElement).toBe(items[2]);
      });
    });
  });
});
