'use client';

import { clsx } from 'clsx';
import type { PointerEvent, ReactNode } from 'react';

import { FINE_POINTER_QUERY, TILT_MAX_DEG } from '../consts';
import { useMediaQuery, useReducedMotion } from '../hooks';

interface ITiltPanelProps {
  className?: string;
  children: ReactNode;
}

export const TiltPanel = ({ className, children }: ITiltPanelProps) => {
  const finePointer = useMediaQuery(FINE_POINTER_QUERY);
  const reducedMotion = useReducedMotion();
  const tilts = finePointer && !reducedMotion;

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!tilts) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const ratioX = (event.clientX - rect.left) / rect.width - 0.5;
    const ratioY = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.transform = `perspective(900px) rotateX(${(-ratioY * TILT_MAX_DEG).toFixed(2)}deg) rotateY(${(ratioX * TILT_MAX_DEG).toFixed(2)}deg)`;
  };

  const handleLeave = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.transform = '';
  };

  return (
    <div
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={clsx('transition-transform duration-300 ease-out will-change-transform', className)}
    >
      {children}
    </div>
  );
};
