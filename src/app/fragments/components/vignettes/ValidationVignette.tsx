'use client';

import { useMemo } from 'react';

import type { THeroEdgeTone } from '@interfaces';

import { useTranslations } from '@/i18n';

import {
  VALIDATION_VIGNETTE_EDGES,
  VALIDATION_VIGNETTE_INTERVAL_MS,
  VALIDATION_VIGNETTE_PHASES,
  VALIDATION_VIGNETTE_REPAIRED_EDGES,
} from '../../consts';
import { useVignettePhase } from '../../hooks';
import { CanvasVignette } from '../CanvasVignette';
import { MiniNode } from '../MiniNode';

export const ValidationVignette = () => {
  const t = useTranslations();
  const phase = useVignettePhase(VALIDATION_VIGNETTE_PHASES, VALIDATION_VIGNETTE_INTERVAL_MS);
  const premiseRefuted = phase > 0;
  const conclusionAffected = phase === 1;

  const tones = useMemo(
    () =>
      new Map<string, THeroEdgeTone>([
        ['vv-pc', premiseRefuted ? 'tainted' : 'valid'],
        ['vv-sc', 'valid'],
      ]),
    [premiseRefuted],
  );

  return (
    <CanvasVignette
      edges={phase === 2 ? VALIDATION_VIGNETTE_REPAIRED_EDGES : VALIDATION_VIGNETTE_EDGES}
      tones={tones}
      className="h-44 sm:h-40"
    >
      <MiniNode
        nodeId="vv-p"
        tone={premiseRefuted ? 'refuted' : 'valid'}
        label={t.landing.product.vignettes.validationPremise}
        className="absolute top-3 left-3 w-36 sm:top-4 sm:left-4 sm:w-44"
      />
      <MiniNode
        nodeId="vv-s"
        tone="valid"
        label={t.landing.product.vignettes.validationSafe}
        className="absolute bottom-3 left-3 w-36 sm:bottom-4 sm:left-[30%] sm:w-44"
      />
      <MiniNode
        nodeId="vv-c"
        tone={conclusionAffected ? 'affected' : 'valid'}
        label={t.landing.product.vignettes.validationConclusion}
        className="absolute top-1/2 right-3 w-36 -translate-y-1/2 sm:right-4 sm:w-44"
      />
    </CanvasVignette>
  );
};
