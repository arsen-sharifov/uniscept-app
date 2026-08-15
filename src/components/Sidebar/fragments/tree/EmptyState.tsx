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
    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[color:var(--border-active)] bg-[color:var(--accent-soft)]">
      <Icon className="h-5 w-5 text-[color:var(--accent-text)]" />
    </div>
    <p className="mb-1 font-grotesk text-xs font-semibold text-[color:var(--text-strong)]">{title}</p>
    {hint && <p className="mb-3 max-w-[200px] text-[11px] leading-snug text-[color:var(--text-muted)]">{hint}</p>}
    {ctaLabel && onCta && (
      <button
        type="button"
        onClick={onCta}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[color:var(--accent)] px-3 py-1.5 font-grotesk text-[11px] font-semibold text-[color:var(--on-accent)] shadow-[0_10px_28px_-12px_var(--accent-glow)] transition-colors duration-150 hover:bg-[color:var(--accent-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none active:bg-[color:var(--accent-strong)] motion-reduce:transition-none"
      >
        {CtaIcon && <CtaIcon className="h-3 w-3" />}
        {ctaLabel}
      </button>
    )}
  </div>
);
