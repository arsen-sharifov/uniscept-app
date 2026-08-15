'use client';

import { useTranslations } from '@/i18n';

import { REFERENCES_VIGNETTE_EDGES, REFERENCES_VIGNETTE_TONES } from '../../consts';
import { CanvasVignette } from '../CanvasVignette';
import { MiniNode } from '../MiniNode';

export const ReferencesVignette = () => {
  const t = useTranslations();

  return (
    <CanvasVignette edges={REFERENCES_VIGNETTE_EDGES} tones={REFERENCES_VIGNETTE_TONES} className="h-40">
      <span className="absolute top-3 right-3 font-mono-ui text-[8.5px] font-bold tracking-[0.14em] text-[color:var(--hero-ground-muted)] uppercase">
        {t.landing.product.vignettes.referencesCanvasA}
      </span>
      <span className="absolute bottom-3 left-3 font-mono-ui text-[8.5px] font-bold tracking-[0.14em] text-[color:var(--hero-ground-muted)] uppercase">
        {t.landing.product.vignettes.referencesCanvasB}
      </span>
      <MiniNode
        nodeId="rv-s"
        tone="valid"
        label={t.landing.product.vignettes.referencesSource}
        className="absolute top-3 left-3 w-32"
      />
      <MiniNode
        nodeId="rv-r"
        tone="reference"
        label={t.landing.product.vignettes.referencesSource}
        className="absolute right-3 bottom-3 w-32 animate-node-pulse motion-reduce:animate-none"
      />
    </CanvasVignette>
  );
};
