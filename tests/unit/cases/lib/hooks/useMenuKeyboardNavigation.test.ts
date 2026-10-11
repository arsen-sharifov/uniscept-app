import { renderHook } from '@testing-library/react';
import type { KeyboardEvent } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useMenuKeyboardNavigation } from '@hooks';

const trigger = document.createElement('button');
const menu = document.createElement('div');
const items = ['first', 'second', 'third'].map((label) => {
  const item = document.createElement('button');
  item.setAttribute('role', 'menuitem');
  item.textContent = label;

  return item;
});

menu.append(...items);

const listbox = document.createElement('div');
const options = ['first', 'second'].map((label) => {
  const option = document.createElement('button');
  option.setAttribute('role', 'option');
  option.textContent = label;

  return option;
});

listbox.append(...options);

const emptyMenu = document.createElement('div');

const preventDefault = vi.fn();
const onOpen = vi.fn();
const onClose = vi.fn();

const keyDown = (key: string, target: Element) =>
  ({ key, preventDefault, target }) as unknown as KeyboardEvent<HTMLElement>;

let navigation: ReturnType<typeof useMenuKeyboardNavigation>;

beforeEach(() => {
  document.body.append(trigger, menu);
  navigation = renderHook(() => useMenuKeyboardNavigation({ current: menu }, { onOpen, onClose })).result.current;
});

afterEach(() => {
  trigger.remove();
  menu.remove();
  listbox.remove();
  emptyMenu.remove();
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
        navigation.handleKeyDown(keyDown('ArrowDown', items[0]!));
      });

      test('THEN focus moves to the next item and the key is consumed', () => {
        expect(document.activeElement).toBe(items[1]);
        expect(preventDefault).toHaveBeenCalledOnce();
        expect(onOpen).not.toHaveBeenCalled();
      });
    });

    describe('WHEN ArrowUp is pressed on the first item', () => {
      beforeEach(() => {
        navigation.focusItem(0);
        navigation.handleKeyDown(keyDown('ArrowUp', items[0]!));
      });

      test('THEN focus wraps to the last item', () => {
        expect(document.activeElement).toBe(items[2]);
      });
    });

    describe('WHEN End and then Home are pressed', () => {
      beforeEach(() => {
        navigation.focusItem(1);
        navigation.handleKeyDown(keyDown('End', items[1]!));
        navigation.handleKeyDown(keyDown('Home', items[2]!));
      });

      test('THEN focus lands on the first item', () => {
        expect(document.activeElement).toBe(items[0]);
      });
    });

    describe('WHEN an unrelated key is pressed', () => {
      beforeEach(() => {
        navigation.focusItem(0);
        navigation.handleKeyDown(keyDown('Enter', items[0]!));
      });

      test('THEN focus stays put and the key is left alone', () => {
        expect(document.activeElement).toBe(items[0]);
        expect(preventDefault).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
      });
    });

    describe('WHEN ArrowUp is pressed while nothing inside the menu is focused', () => {
      beforeEach(() => {
        navigation.handleKeyDown(keyDown('ArrowUp', menu));
      });

      test('THEN focus starts from the last item', () => {
        expect(document.activeElement).toBe(items[2]);
      });
    });

    describe('WHEN Tab is pressed inside the menu', () => {
      beforeEach(() => {
        navigation.focusItem(1);
        navigation.handleKeyDown(keyDown('Tab', items[1]!));
      });

      test('THEN the menu is asked to close and the browser keeps moving focus', () => {
        expect(onClose).toHaveBeenCalledOnce();
        expect(preventDefault).not.toHaveBeenCalled();
        expect(document.activeElement).toBe(items[1]);
      });
    });
  });

  describe('GIVEN a trigger button outside the menu', () => {
    describe('WHEN an arrow key is pressed on the trigger', () => {
      beforeEach(() => {
        navigation.handleKeyDown(keyDown('ArrowDown', trigger));
      });

      test('THEN the menu is asked to open instead of moving focus', () => {
        expect(onOpen).toHaveBeenCalledOnce();
        expect(preventDefault).toHaveBeenCalledOnce();
        expect(document.activeElement).not.toBe(items[0]);
      });
    });

    describe('WHEN Tab or Enter is pressed on the trigger', () => {
      beforeEach(() => {
        navigation.handleKeyDown(keyDown('Tab', trigger));
        navigation.handleKeyDown(keyDown('Enter', trigger));
      });

      test('THEN the trigger keeps its native behaviour', () => {
        expect(onOpen).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
        expect(preventDefault).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a menu without open and close callbacks', () => {
    beforeEach(() => {
      navigation = renderHook(() => useMenuKeyboardNavigation({ current: menu })).result.current;
    });

    describe('WHEN Tab is pressed inside the menu and an arrow key on the trigger', () => {
      beforeEach(() => {
        navigation.handleKeyDown(keyDown('Tab', menu));
        navigation.handleKeyDown(keyDown('ArrowDown', trigger));
      });

      test('THEN both keys are left alone', () => {
        expect(preventDefault).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a listbox whose items are options', () => {
    beforeEach(() => {
      document.body.append(listbox);
      navigation = renderHook(() => useMenuKeyboardNavigation({ current: listbox }, { itemRole: 'option' })).result
        .current;
    });

    describe('WHEN ArrowDown is pressed on the first option', () => {
      beforeEach(() => {
        navigation.focusItem(0);
        navigation.handleKeyDown(keyDown('ArrowDown', options[0]!));
      });

      test('THEN focus moves to the second option', () => {
        expect(document.activeElement).toBe(options[1]);
        expect(preventDefault).toHaveBeenCalledOnce();
      });
    });
  });

  describe('GIVEN a menu without any item', () => {
    beforeEach(() => {
      document.body.append(emptyMenu);
      navigation = renderHook(() => useMenuKeyboardNavigation({ current: emptyMenu })).result.current;
    });

    describe('WHEN ArrowDown is pressed inside it', () => {
      beforeEach(() => {
        navigation.handleKeyDown(keyDown('ArrowDown', emptyMenu));
      });

      test('THEN the key is left alone', () => {
        expect(preventDefault).not.toHaveBeenCalled();
      });
    });
  });
});
