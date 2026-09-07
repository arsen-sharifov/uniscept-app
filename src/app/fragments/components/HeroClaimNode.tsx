'use client';

import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import type { IHeroClaim, TEffectiveStatus } from '@interfaces';

import { NODE_ALARM_WASHES } from '@/components/Canvas/consts';
import { NodeBand } from '@/components/Canvas/fragments';
import { useTranslations } from '@/i18n';

import {
  HERO_BAND_TONES,
  HERO_CASCADE_STEP_MS,
  HERO_CLAIM_HANDLE_CLASSES,
  HERO_ENTRANCE_NODE_STAGGER_MS,
} from '../consts';
import { buildToneLabels, resolveClaimTone } from '../utils';

interface IHeroClaimNodeProps {
  claim: IHeroClaim;
  status: TEffectiveStatus | undefined;
  depth: number | undefined;
  entranceIndex: number;
  isEntering: boolean;
  isRetired: boolean;
  onHover: (id: string | null) => void;
}

export const HeroClaimNode = ({
  claim,
  status,
  depth,
  entranceIndex,
  isEntering,
  isRetired,
  onHover,
}: IHeroClaimNodeProps) => {
  const t = useTranslations();

  const tone = resolveClaimTone(claim, status);
  const bandTone = HERO_BAND_TONES[tone];
  const wash = NODE_ALARM_WASHES[bandTone];

  return (
    <div
      onMouseEnter={() => onHover(claim.id)}
      onMouseLeave={() => onHover(null)}
      data-hero-node={claim.id}
      data-status={tone}
      data-retired={isRetired || undefined}
      style={
        {
          '--hero-x': `${claim.x}%`,
          '--hero-y': `${claim.y}%`,
          '--hero-w': `${claim.width}rem`,
          transitionDelay: `${(depth ?? 0) * HERO_CASCADE_STEP_MS}ms`,
          animationDelay: isEntering ? `${entranceIndex * HERO_ENTRANCE_NODE_STAGGER_MS}ms` : '0ms',
          backgroundImage: wash ? `linear-gradient(${wash}, ${wash})` : undefined,
        } as CSSProperties
      }
      className={clsx(
        'hero-claim group/claim relative w-full max-w-(--hero-w) animate-node-drop rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] text-left shadow-[var(--shadow-pip)] [animation-fill-mode:backwards] hover:shadow-[var(--shadow-card-hover)] motion-reduce:animate-none',
        claim.anchor === 'right' ? 'lg:right-(--hero-x)' : 'lg:left-(--hero-x)',
        'lg:absolute lg:top-(--hero-y) lg:w-(--hero-w) lg:max-w-none',
        claim.desktopOnly && 'hidden lg:block',
        claim.align === 'end' && 'self-end',
      )}
    >
      <span aria-hidden className="hero-claim__stamp pointer-events-none font-grotesk">
        {t.landing.hero.demo.statusRefuted}
      </span>

      <div className="flex flex-col gap-1.5 px-3.5 py-3">
        <NodeBand
          tone={bandTone}
          label={buildToneLabels(t.landing)[tone]}
          trailing={
            <span className="ml-auto flex items-center gap-1.5">
              {claim.id === 'q' && (
                <span className="rounded border border-[color:var(--border-strong)] bg-[color:var(--surface-overlay)] px-1 font-mono-ui text-[8px] font-bold tracking-[0.12em] text-[color:var(--text-muted)] uppercase">
                  {t.landing.hero.demo.demoTag}
                </span>
              )}
              <span className="font-mono-ui text-[9px] tracking-[0.08em] text-[color:var(--text-subtle)]">
                {claim.code}
              </span>
            </span>
          }
        />

        <p className="w-fit font-grotesk text-[13.5px] leading-snug tracking-tight text-[color:var(--text-strong)]">
          {t.landing.hero.demo.claims[claim.id]}
        </p>
      </div>

      {Object.entries(HERO_CLAIM_HANDLE_CLASSES).map(([side, handleClass]) => (
        <span
          key={side}
          aria-hidden
          className={clsx(
            'absolute h-2 w-2 rounded-full border border-[color:var(--surface)] bg-[color:var(--accent)] opacity-0 shadow-[0_0_0_3px_var(--accent-soft)] transition-opacity duration-200 group-hover/claim:opacity-100',
            handleClass,
          )}
        />
      ))}
    </div>
  );
};
