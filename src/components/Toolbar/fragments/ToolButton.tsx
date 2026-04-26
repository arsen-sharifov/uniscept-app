'use client';

import { useCallback, useRef, useState } from 'react';
import { clsx } from 'clsx';
import type { IToolItem } from '@interfaces';

interface IToolButtonProps {
  tool: IToolItem;
  active: boolean;
  onClick: (id: string) => void;
  onPointerEnter?: (rect: DOMRect, tool: IToolItem) => void;
  onPointerLeave?: () => void;
}

export const ToolButton = ({
  tool,
  active,
  onClick,
  onPointerEnter,
  onPointerLeave,
}: IToolButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [flash, setFlash] = useState(false);
  const isAction = tool.kind === 'action';
  const Icon = tool.icon;

  const handleClick = useCallback(() => {
    if (tool.disabled) return;
    onClick(tool.id);
    if (isAction) {
      setFlash(true);
      window.setTimeout(() => setFlash(false), 220);
    }
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
        aria-keyshortcuts={tool.shortcut}
        className={clsx(
          'relative flex h-9 w-9 items-center justify-center rounded-[10px] outline-none',
          'transition-[background,color,box-shadow,transform] duration-150 ease-out motion-reduce:transition-none',
          'focus-visible:ring-2 focus-visible:ring-emerald-500/45 focus-visible:ring-offset-1 focus-visible:ring-offset-white',
          tool.disabled && 'cursor-not-allowed text-black/20',
          !tool.disabled &&
            !active && [
              'text-black/55 hover:text-black/90',
              'hover:bg-black/[0.04] active:bg-black/[0.08]',
              'active:scale-[0.94]',
            ],
          !tool.disabled &&
            active &&
            !isAction &&
            'bg-emerald-500/10 text-emerald-700',
          flash && ['bg-emerald-500/10 text-emerald-700', 'scale-[1.08]']
        )}
      >
        <span
          aria-hidden
          className={clsx(
            'pointer-events-none absolute top-1/2 -right-px z-10 h-5 w-[3px] -translate-y-1/2 rounded-l-full bg-gradient-to-b from-emerald-500 to-cyan-500 transition-opacity duration-200 ease-out motion-reduce:transition-none',
            active && !isAction ? 'opacity-100' : 'opacity-0'
          )}
        />
        <Icon
          className="h-[17px] w-[17px]"
          strokeWidth={active && !isAction ? 2 : 1.85}
        />
      </button>
    </div>
  );
};
