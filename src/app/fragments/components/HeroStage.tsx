'use client';

import { useEffect, useRef, useState } from 'react';

import type { IHeroCascade } from '@interfaces';

import { HERO_ENTRANCE_TOTAL_MS } from '../consts';
import { useEdgePaths, useWorldArrival } from '../hooks';
import { HeroClaimNode } from './HeroClaimNode';
import { HeroEdgeLayer } from './HeroEdgeLayer';

interface IHeroStageProps {
  cascade: IHeroCascade;
}

export const HeroStage = ({
  cascade: { phase, claims, edges, statuses, edgeTones, depths, refutedIds },
}: IHeroStageProps) => {
  const { content: ready } = useWorldArrival();
  const stageRef = useRef<HTMLDivElement>(null);
  const [isEntering, setIsEntering] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const paths = useEdgePaths(stageRef, edges);

  useEffect(() => {
    if (!ready) return;

    const timer = setTimeout(() => setIsEntering(false), HERO_ENTRANCE_TOTAL_MS);

    return () => clearTimeout(timer);
  }, [ready]);

  return (
    <div ref={stageRef} className="relative min-h-[420px] p-4 lg:h-[520px] lg:p-0">
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
  );
};
