'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';

import type { IHeroCascade } from '@interfaces';

import { HERO_ENTRANCE_TOTAL_MS, HERO_STAGE_DESIGN_WIDTH_PX } from '../consts';
import { useEdgePaths, useStageScale, useWorldArrival } from '../hooks';
import { HeroClaimNode } from './HeroClaimNode';
import { HeroEdgeLayer } from './HeroEdgeLayer';

interface IHeroStageProps {
  cascade: IHeroCascade;
}

export const HeroStage = ({
  cascade: { phase, claims, edges, statuses, edgeTones, depths, refutedIds },
}: IHeroStageProps) => {
  const { content: ready } = useWorldArrival();
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const scale = useStageScale(frameRef);
  const [isEntering, setIsEntering] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const paths = useEdgePaths(stageRef, edges);

  useEffect(() => {
    if (!ready) return;

    const timer = setTimeout(() => setIsEntering(false), HERO_ENTRANCE_TOTAL_MS);

    return () => clearTimeout(timer);
  }, [ready]);

  return (
    <div
      ref={frameRef}
      style={{ '--hero-stage-scale': scale, '--hero-stage-width': `${HERO_STAGE_DESIGN_WIDTH_PX}px` } as CSSProperties}
      className="relative lg:h-[calc(520px*var(--hero-stage-scale))]"
    >
      <div
        ref={stageRef}
        className="relative min-h-[420px] p-4 lg:absolute lg:top-0 lg:left-0 lg:h-[520px] lg:w-[max(100%,var(--hero-stage-width))] lg:origin-top-left lg:scale-(--hero-stage-scale) lg:p-0"
      >
        <div aria-hidden className="hero-grid absolute inset-0" />
        <HeroEdgeLayer paths={paths} tones={edgeTones} isEntering={isEntering} hoveredId={hoveredId} />
        <div className="relative flex flex-col items-start gap-4 pt-2 lg:static lg:pt-0">
          {claims.map((claim, index) => (
            <HeroClaimNode
              key={claim.id}
              claim={claim}
              status={statuses.get(claim.id)}
              depth={depths.get(claim.id)}
              entranceIndex={index + 1}
              isEntering={isEntering}
              isRetired={phase === 'repaired' && refutedIds.has(claim.id)}
              onHover={setHoveredId}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
