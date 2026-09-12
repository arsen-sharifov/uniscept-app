'use client';

import { type KeyboardEvent, type RefObject, useCallback } from 'react';

const MENU_ITEM_SELECTOR = '[role="menuitem"]';

export const useMenuKeyboardNavigation = (menuRef: RefObject<HTMLElement | null>) => {
  const getItems = useCallback(
    () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR) ?? []),
    [menuRef],
  );

  const focusItem = useCallback(
    (index: number) => {
      const items = getItems();
      items.forEach((item, position) => {
        item.tabIndex = position === index ? 0 : -1;
      });
      items[index]?.focus();
    },
    [getItems],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const items = getItems();
      if (items.length === 0) return;
      const current = items.findIndex((item) => item === document.activeElement);
      const targets: Record<string, number> = {
        ArrowDown: (current + 1) % items.length,
        ArrowUp: (Math.max(current, 0) - 1 + items.length) % items.length,
        Home: 0,
        End: items.length - 1,
      };
      const next = targets[event.key];
      if (next === undefined) return;
      event.preventDefault();
      focusItem(next);
    },
    [getItems, focusItem],
  );

  return { focusItem, handleKeyDown };
};
