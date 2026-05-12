'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import type { IToolItem } from '@interfaces';
import { FLASH_DURATION_MS } from '../consts';
import { toAriaShortcut } from '../utils';

interface IToolButtonProps {
  tool: IToolItem;
  active: boolean;
  onClick: (id: string) => void;
  onPointerEnter?: (rect: DOMRect, tool: IToolItem) => void;
  onPointerLeave?: () => void;
}

export const ToolButton = ({ tool, active, onClick, onPointerEnter, onPointerLeave }: IToolButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const flashTimerRef = useRef<number | null>(null);
  const [flash, setFlash] = useState(false);
  const isAction = tool.kind === 'action';
  const Icon = tool.icon;

  useEffect(
    () => () => {
      if (flashTimerRef.current !== null) {
        window.clearTimeout(flashTimerRef.current);
      }
    },
    []
  );

  const handleClick = useCallback(() => {
    if (tool.disabled) return;

    onClick(tool.id);
    if (!isAction) return;

    setFlash(true);

    if (flashTimerRef.current !== null) {
      window.clearTimeout(flashTimerRef.current);
    }

    flashTimerRef.current = window.setTimeout(() => {
      flashTimerRef.current = null;
      setFlash(false);
    }, FLASH_DURATION_MS);
  }, [tool.id, tool.disabled, isAction, onClick]);

  const handleEnter = useCallback(() => {
    if (!buttonRef.current || !onPointerEnter) return;

    onPointerEnter(buttonRef.current.getBoundingClientRect(), tool);
  }, [onPointerEnter, tool]);

  return (
    <div className="relative flex w-full items-center justify-center">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        onPointerEnter={handleEnter}
        onPointerLeave={onPointerLeave}
        onFocus={handleEnter}
        onBlur={onPointerLeave}
        disabled={tool.disabled}
        aria-label={tool.label}
        aria-pressed={!isAction ? active : undefined}
        aria-keyshortcuts={toAriaShortcut(tool.shortcut)}
        className={clsx(
          'relative flex h-9 w-9 items-center justify-center rounded-[10px] outline-none',
          'transition-[background,color,box-shadow,transform] duration-150 ease-out motion-reduce:transition-none',
          'focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--surface)]',
          tool.disabled && 'cursor-not-allowed text-[color:var(--text-faint)]',
          !tool.disabled &&
            !active && [
              'text-[color:var(--text-muted)] hover:text-[color:var(--text-strong)]',
              'hover:bg-[color:var(--surface-overlay)] active:bg-[color:var(--surface-overlay)]',
              'active:scale-[0.94]',
            ],
          !tool.disabled && active && !isAction && 'bg-[color:var(--accent-soft)] text-[color:var(--accent-text)]',
          flash && ['bg-[color:var(--accent-soft)] text-[color:var(--accent-text)]', 'scale-[1.08]']
        )}
      >
        <span
          aria-hidden
          className={clsx(
            'pointer-events-none absolute top-1/2 -right-px z-10 h-5 w-[3px] -translate-y-1/2 rounded-l-full bg-gradient-to-b from-[color:var(--accent)] to-[color:var(--accent-2)] transition-opacity duration-200 ease-out motion-reduce:transition-none',
            active && !isAction ? 'opacity-100' : 'opacity-0'
          )}
        />
        <Icon className="h-[17px] w-[17px]" strokeWidth={active && !isAction ? 2 : 1.85} />
      </button>
    </div>
  );
};
