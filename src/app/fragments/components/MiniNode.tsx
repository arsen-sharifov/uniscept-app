'use client';

import { clsx } from 'clsx';
import { MessageSquare } from 'lucide-react';

import type { THeroMiniTone } from '@interfaces';

import { NodeBand } from '@/components/Canvas/fragments';
import { useTranslations } from '@/i18n';

import { HERO_BAND_TONES } from '../consts';
import { buildToneLabels } from '../utils';

interface IMiniNodeProps {
  tone: THeroMiniTone;
  label: string;
  nodeId?: string;
  commentCount?: number;
  className?: string;
}

export const MiniNode = ({ tone, label, nodeId, commentCount, className }: IMiniNodeProps) => {
  const t = useTranslations();

  return (
    <div
      data-status={tone}
      data-hero-node={nodeId}
      className={clsx(
        'mini-node flex flex-col gap-1 rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] px-2.5 py-2 shadow-[var(--shadow-pip)]',
        className,
      )}
    >
      <NodeBand
        tone={HERO_BAND_TONES[tone]}
        label={buildToneLabels(t.landing)[tone]}
        trailing={
          commentCount !== undefined && (
            <span className="ml-auto flex items-center gap-0.5 rounded bg-[color:var(--accent-soft)] px-1 font-mono-ui text-[8px] font-bold text-[color:var(--accent-text)] normal-case">
              <MessageSquare aria-hidden className="h-2 w-2" strokeWidth={2.5} />
              {commentCount}
            </span>
          )
        }
      />
      <p className="font-grotesk text-[11.5px] leading-snug tracking-tight text-[color:var(--text-strong)]">{label}</p>
    </div>
  );
};
