'use client';

import type { LucideIcon } from 'lucide-react';

interface IEmptyStateProps {
  icon: LucideIcon;
  title: string;
  hint?: string;
  ctaLabel?: string;
  onCta?: () => void;
  ctaIcon?: LucideIcon;
}

export const EmptyState = ({
  icon: Icon,
  title,
  hint,
  ctaLabel,
  onCta,
  ctaIcon: CtaIcon,
}: IEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center px-4 py-8 text-center">
      <div className="relative mb-3">
        <div className="absolute inset-0 -m-2 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 blur-xl" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-black/5 bg-white shadow-sm">
          <Icon className="h-5 w-5 text-emerald-600" />
        </div>
      </div>
      <p className="mb-1 text-xs font-semibold text-black/70">{title}</p>
      {hint && (
        <p className="mb-3 max-w-[200px] text-[11px] leading-snug text-black/40">
          {hint}
        </p>
      )}
      {ctaLabel && onCta && (
        <button
          type="button"
          onClick={onCta}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-all duration-150 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
        >
          {CtaIcon && <CtaIcon className="h-3 w-3" />}
          {ctaLabel}
        </button>
      )}
    </div>
  );
};
