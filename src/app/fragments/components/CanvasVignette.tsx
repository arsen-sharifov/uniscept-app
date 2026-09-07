'use client';

import { clsx } from 'clsx';
import { type ReactNode, useRef } from 'react';

import type { IHeroEdge, THeroEdgeTone } from '@interfaces';

import { EMPTY_VIGNETTE_EDGES, EMPTY_VIGNETTE_TONES } from '../consts';
import { useEdgePaths } from '../hooks';
import { HeroEdgeLayer } from './HeroEdgeLayer';

interface ICanvasVignetteProps {
  edges?: IHeroEdge[];
  tones?: ReadonlyMap<string, THeroEdgeTone>;
  className?: string;
  children: ReactNode;
}

export const CanvasVignette = ({
  edges = EMPTY_VIGNETTE_EDGES,
  tones = EMPTY_VIGNETTE_TONES,
  className,
  children,
}: ICanvasVignetteProps) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const paths = useEdgePaths(stageRef, edges);

  return (
    <div
      ref={stageRef}
      className={clsx(
        'canvas-vignette relative overflow-hidden rounded-lg border border-[color:var(--hero-hairline-soft)] bg-[color:var(--hero-ground-deep)]',
        className,
      )}
    >
      <div aria-hidden className="hero-grid absolute inset-0 opacity-60" />
      <HeroEdgeLayer paths={paths} tones={tones} isEntering={false} hoveredId={null} />
      {children}
    </div>
  );
};
