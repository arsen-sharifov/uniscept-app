'use client';

import { useTranslations } from '@/i18n';

interface IErrorFallbackProps {
  onReset?: () => void;
}

export const ErrorFallback = ({ onReset }: IErrorFallbackProps) => {
  const t = useTranslations();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-sm font-semibold text-[color:var(--text-strong)]">{t.common.errorPages.errorTitle}</p>
      <p className="max-w-xs text-[13px] text-[color:var(--text-muted)]">{t.common.errorPages.errorHint}</p>
      <button
        type="button"
        onClick={onReset ?? (() => window.location.assign(new URL('/platform', window.location.origin)))}
        className="mt-1 rounded-xl bg-[color:var(--accent)] px-4 py-1.5 text-[13px] font-medium text-[color:var(--on-accent)] shadow-[0_6px_14px_-8px_var(--accent-glow)] transition-transform hover:-translate-y-0.5"
      >
        {onReset ? t.common.errorPages.retry : t.common.errorPages.backHome}
      </button>
    </div>
  );
};
