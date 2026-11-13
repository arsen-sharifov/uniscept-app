'use client';

import { useTranslations } from '@/i18n';

import { STRUCTURED_VIGNETTE_EDGES } from '../../consts';
import { CanvasVignette } from '../CanvasVignette';
import { MiniNode } from '../MiniNode';

export const StructuredVignette = () => {
  const t = useTranslations();

  return (
    <CanvasVignette edges={STRUCTURED_VIGNETTE_EDGES} className="h-52 sm:h-40">
      <MiniNode
        nodeId="sv-q"
        tone="question"
        label={t.landing.product.vignettes.structuredQuestion}
        className="absolute top-1/2 left-4 w-[min(11rem,44%)] -translate-y-1/2 animate-node-pulse motion-reduce:animate-none"
      />
      <MiniNode
        nodeId="sv-a"
        tone="open"
        label={t.landing.product.vignettes.structuredClaimA}
        className="absolute top-3 right-4 w-[min(9rem,38%)]"
      />
      <MiniNode
        nodeId="sv-b"
        tone="open"
        label={t.landing.product.vignettes.structuredClaimB}
        className="absolute right-4 bottom-3 w-[min(9rem,38%)]"
      />
    </CanvasVignette>
  );
};
