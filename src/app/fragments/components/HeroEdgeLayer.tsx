'use client';

import { clsx } from 'clsx';

import type { IHeroEdgePath, THeroEdgeTone } from '@interfaces';

import {
  HERO_EDGE_TONE_STROKES,
  HERO_ENTRANCE_EDGE_BASE_MS,
  HERO_ENTRANCE_EDGE_STAGGER_MS,
  HERO_FLOWING_EDGE_TONES,
} from '../consts';

interface IHeroEdgeLayerProps {
  paths: IHeroEdgePath[];
  tones: ReadonlyMap<string, THeroEdgeTone>;
  isEntering: boolean;
  hoveredId: string | null;
}

export const HeroEdgeLayer = ({ paths, tones, isEntering, hoveredId }: IHeroEdgeLayerProps) => (
  <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
    {paths.map((path, index) => {
      const tone = tones.get(path.id) ?? 'default';
      const isFlowing = HERO_FLOWING_EDGE_TONES.includes(tone);
      const isDimmed = hoveredId !== null && path.source !== hoveredId && path.target !== hoveredId;

      return (
        <path
          key={path.id}
          d={path.d}
          fill="none"
          stroke={HERO_EDGE_TONE_STROKES[tone]}
          strokeWidth={hoveredId !== null && !isDimmed ? 2 : 1.5}
          markerEnd={`url(#hero-arrow-${tone})`}
          pathLength={100}
          style={{
            animationDelay: isEntering
              ? `${HERO_ENTRANCE_EDGE_BASE_MS + index * HERO_ENTRANCE_EDGE_STAGGER_MS}ms`
              : '0ms',
          }}
          className={clsx(
            'transition-[stroke,opacity,stroke-width] duration-300 ease-out [animation-fill-mode:backwards] motion-reduce:animate-none motion-reduce:transition-none',
            isEntering && 'hero-edge-draw',
            !isEntering && isFlowing && 'hero-edge-flow',
            isDimmed && 'hero-edge--dim',
          )}
        />
      );
    })}
  </svg>
);
