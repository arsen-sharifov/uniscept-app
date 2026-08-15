import Link from 'next/link';

import { getTranslations } from '@/i18n/translations';

const NotFound = async () => {
  const t = await getTranslations();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--app-bg)] px-6">
      <div className="app-panel relative flex w-full max-w-sm flex-col items-center gap-2 overflow-hidden rounded-xl border border-[color:var(--border)] px-6 py-7 text-center">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[color:var(--text-faint)]"
        />

        <p className="font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--text-subtle)] uppercase">
          404
        </p>
        <h1 className="font-grotesk text-base font-semibold text-[color:var(--text-strong)]">
          {t.common.errorPages.notFoundTitle}
        </h1>
        <p className="max-w-xs font-grotesk text-sm leading-relaxed text-[color:var(--text-muted)]">
          {t.common.errorPages.notFoundHint}
        </p>

        <Link
          href="/platform"
          className="mt-2 rounded-lg bg-[color:var(--accent)] px-4 py-2 font-grotesk text-sm font-medium text-[color:var(--on-accent)] shadow-[0_10px_28px_-12px_var(--accent-glow)] transition-[background-color,translate] duration-200 ease-out hover:bg-[color:var(--accent-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none active:translate-y-px motion-reduce:transition-none"
        >
          {t.common.errorPages.backHome}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
