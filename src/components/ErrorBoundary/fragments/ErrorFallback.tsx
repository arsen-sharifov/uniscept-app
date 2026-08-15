'use client';

import { TriangleAlert } from 'lucide-react';

import { useTranslations } from '@/i18n';

interface IErrorFallbackProps {
  onReset?: () => void;
}

export const ErrorFallback = ({ onReset }: IErrorFallbackProps) => {
  const t = useTranslations();

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <div className="app-panel relative flex w-full max-w-sm flex-col items-center gap-2 overflow-hidden rounded-xl border border-[color:var(--border)] px-5 py-4 text-center">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[color:var(--status-error)]"
        />
        <span
          aria-hidden
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--status-error-soft)] text-[color:var(--status-error)]"
        >
          <TriangleAlert className="h-4 w-4" strokeWidth={2} />
        </span>
        <p className="font-grotesk text-sm font-semibold text-[color:var(--text-strong)]">
          {t.common.errorPages.errorTitle}
        </p>
        <p className="max-w-xs font-grotesk text-[13px] text-[color:var(--text-muted)]">
          {t.common.errorPages.errorHint}
        </p>
        <button
          type="button"
          onClick={onReset ?? (() => window.location.assign(new URL('/platform', window.location.origin)))}
          className="mt-1 cursor-pointer rounded-lg bg-[color:var(--accent)] px-4 py-1.5 font-grotesk text-[13px] font-medium text-[color:var(--on-accent)] shadow-[0_10px_28px_-12px_var(--accent-glow)] transition-[background-color,translate] duration-200 ease-out hover:bg-[color:var(--accent-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none active:translate-y-px motion-reduce:transition-none"
        >
          {onReset ? t.common.errorPages.retry : t.common.errorPages.backHome}
        </button>
      </div>
    </div>
  );
};
