'use client';

import { type MouseEvent, useEffect, useId, useRef, useState } from 'react';

import type { IToolbarMenu, TMenuOpener } from '@interfaces';
import { useClickOutside, useEscapeKey, useMenuKeyboardNavigation } from '@hooks';

export const useToolbarMenu = (busy = false): IToolbarMenu => {
  const [opener, setOpener] = useState<TMenuOpener | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef(false);
  const menuId = useId();

  const open = opener !== null;

  const close = (restoreFocus: boolean) => {
    restoreFocusRef.current = restoreFocus;
    setOpener(null);
  };

  const { focusItem, handleKeyDown } = useMenuKeyboardNavigation(menuRef, {
    onOpen: () => setOpener('keyboard'),
    onClose: () => close(false),
  });

  useClickOutside(rootRef, () => close(false), open);
  useEscapeKey(() => close(true), open);

  useEffect(() => {
    if (opener === 'keyboard') focusItem(0);
    if (opener === 'pointer') menuRef.current?.focus();
  }, [opener, focusItem]);

  useEffect(() => {
    if (open || busy || !restoreFocusRef.current) return;

    restoreFocusRef.current = false;
    buttonRef.current?.focus();
  }, [open, busy]);

  const toggle = (click: MouseEvent<HTMLButtonElement>) => {
    if (open) close(false);
    else setOpener(click.detail === 0 ? 'keyboard' : 'pointer');
  };

  return { open, menuId, rootRef, buttonRef, menuRef, toggle, handleKeyDown, close };
};
