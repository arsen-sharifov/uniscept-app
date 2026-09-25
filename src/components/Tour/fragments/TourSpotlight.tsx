'use client';

import { useState } from 'react';

import type { IAnchorRect } from '@interfaces';
import { SPOTLIGHT_RADIUS } from '@constants';

import { buildScrimPath, inflate } from '../utils';

interface ITourSpotlightProps {
  rect: IAnchorRect | null;
  lit: readonly IAnchorRect[];
  open: readonly IAnchorRect[];
}

export const TourSpotlight = ({ rect, lit, open }: ITourSpotlightProps) => {
  const [nudge, setNudge] = useState(0);
  const ring = rect ? inflate(rect) : null;

  return (
    <svg
      aria-hidden
      data-tour-scrim
      width="100%"
      height="100%"
      className="pointer-events-none fixed inset-0 z-65"
      onPointerDown={() => setNudge((previous) => previous + 1)}
    >
      <path d={buildScrimPath(lit)} fillRule="evenodd" fill="var(--scrim)" />

      <path d={buildScrimPath(open)} fillRule="evenodd" fill="transparent" className="pointer-events-auto" />

      {ring && (
        <rect
          key={nudge}
          x={ring.left}
          y={ring.top}
          width={ring.width}
          height={ring.height}
          rx={SPOTLIGHT_RADIUS}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          className="animate-spotlight-nudge motion-reduce:animate-none"
        />
      )}
    </svg>
  );
};
