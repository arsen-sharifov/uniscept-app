'use client';

import { CheckCircle2 } from 'lucide-react';

import { useTranslations } from '@hooks';
import { useCanvasStore } from '@/lib/stores';

import { isCanvasNodeData } from '../utils';

export const ResolutionBar = () => {
  const t = useTranslations();
  const hasAnswer = useCanvasStore((s) => s.nodes.some((node) => isCanvasNodeData(node.data) && node.data.isAnswer));

  if (!hasAnswer) return null;

  return (
    <div className="absolute top-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-[color:var(--decision-border)] bg-[color:var(--surface)]/90 px-3 py-1 shadow-[0_4px_12px_-6px_rgba(15,23,42,0.18)] backdrop-blur-md">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-tight text-[color:var(--decision-text)]">
        <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--decision)]" strokeWidth={2.25} />
        {t.platform.canvas.resolution.resolved}
      </span>
    </div>
  );
};
