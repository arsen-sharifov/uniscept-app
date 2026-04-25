'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import type { ITooltipPosition, TTooltipPlacement } from '@interfaces';
import { useMounted } from '@hooks';
import { choosePlacement, computeTooltipPosition } from './utils';

export interface ISmartTooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: TTooltipPlacement;
  delay?: number;
  onlyIfTruncated?: boolean;
  className?: string;
  panelClassName?: string;
  disabled?: boolean;
}

export const SmartTooltip = ({
  content,
  children,
  placement = 'top',
  delay = 350,
  onlyIfTruncated = false,
  className,
  panelClassName,
  disabled = false,
}: ISmartTooltipProps) => {
  const mounted = useMounted();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<ITooltipPosition | null>(null);

  const place = () => {
    const triggerRect = triggerRef.current?.getBoundingClientRect();
    const tooltipRect = tipRef.current?.getBoundingClientRect();
    if (!triggerRect || !tooltipRect) return;

    const tooltipSize = {
      width: tooltipRect.width,
      height: tooltipRect.height,
    };
    const chosen = choosePlacement(placement, triggerRect, tooltipSize);
    setPos(computeTooltipPosition(chosen, triggerRect, tooltipSize));
  };

  useLayoutEffect(() => {
    if (!open) return;
    place();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const cancel = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleEnter = () => {
    if (disabled) return;
    cancel();
    timerRef.current = window.setTimeout(() => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      if (onlyIfTruncated && trigger.scrollWidth <= trigger.clientWidth + 1)
        return;
      setOpen(true);
    }, delay);
  };

  const handleLeave = () => {
    cancel();
    setOpen(false);
  };

  useEffect(() => () => cancel(), []);

  const isHorizontal = pos?.placement === 'left' || pos?.placement === 'right';

  const arrowStyle: CSSProperties = isHorizontal
    ? { top: Math.max(8, Math.min(pos?.arrowTop ?? 0, 9999)) }
    : { left: Math.max(10, pos?.arrowLeft ?? 0) };

  return (
    <>
      <span
        ref={triggerRef}
        className={className}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
      >
        {children}
      </span>
      {open &&
        mounted &&
        createPortal(
          <div
            ref={tipRef}
            role="tooltip"
            style={{
              position: 'fixed',
              top: pos?.top ?? -9999,
              left: pos?.left ?? -9999,
              opacity: pos ? 1 : 0,
            }}
            className={clsx(
              'pointer-events-none z-[60] max-w-xs rounded-lg border border-black/[0.06] bg-white/95 px-2.5 py-1.5 text-xs font-medium text-black/80 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18),0_2px_6px_-2px_rgba(0,0,0,0.08)] ring-1 ring-emerald-500/10 backdrop-blur-md transition-opacity duration-150',
              panelClassName
            )}
          >
            {content}
            <span
              aria-hidden="true"
              style={arrowStyle}
              className={clsx(
                'pointer-events-none absolute h-2 w-2 rotate-45 border border-black/[0.06] bg-white/95 ring-1 ring-emerald-500/10',
                pos?.placement === 'top' &&
                  '-bottom-[5px] -translate-x-1/2 border-t-0 border-l-0',
                pos?.placement === 'bottom' &&
                  '-top-[5px] -translate-x-1/2 border-r-0 border-b-0',
                pos?.placement === 'left' &&
                  '-right-[5px] -translate-y-1/2 border-b-0 border-l-0',
                pos?.placement === 'right' &&
                  '-left-[5px] -translate-y-1/2 border-t-0 border-r-0'
              )}
            />
          </div>,
          document.body
        )}
    </>
  );
};
