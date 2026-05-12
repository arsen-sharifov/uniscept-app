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

export const EmptyState = ({ icon: Icon, title, hint, ctaLabel, onCta, ctaIcon: CtaIcon }: IEmptyStateProps) => (
  <div className="flex flex-col items-center px-4 py-8 text-center">
    <div className="relative mb-3">
      <div className="absolute inset-0 -m-2 rounded-2xl bg-gradient-to-br from-[color:var(--accent)]/15 to-[color:var(--accent-2)]/15 blur-xl" />
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] shadow-sm">
        <Icon className="h-5 w-5 text-[color:var(--accent)]" />
      </div>
    </div>
    <p className="mb-1 text-xs font-semibold text-[color:var(--text-strong)]">{title}</p>
    {hint && <p className="mb-3 max-w-[200px] text-[11px] leading-snug text-[color:var(--text-muted)]">{hint}</p>}
    {ctaLabel && onCta && (
      <button
        type="button"
        onClick={onCta}
        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--accent-2)] px-3 py-1.5 text-[11px] font-semibold text-[color:var(--on-accent)] shadow-sm transition-all duration-150 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
      >
        {CtaIcon && <CtaIcon className="h-3 w-3" />}
        {ctaLabel}
      </button>
    )}
  </div>
);
