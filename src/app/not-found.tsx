import Link from 'next/link';

import { getTranslations } from '@/i18n/translations';

const NotFound = async () => {
  const t = await getTranslations();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[color:var(--app-bg)] px-6 text-center">
      <p className="text-5xl font-bold text-[color:var(--text-faint)]">404</p>
      <h1 className="text-lg font-semibold text-[color:var(--text-strong)]">{t.common.errorPages.notFoundTitle}</h1>
      <p className="max-w-sm text-sm text-[color:var(--text-muted)]">{t.common.errorPages.notFoundHint}</p>
      <Link
        href="/platform"
        className="mt-2 rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-[color:var(--on-accent)] shadow-[0_8px_18px_-10px_var(--accent-glow)] transition-transform hover:-translate-y-0.5"
      >
        {t.common.errorPages.backHome}
      </Link>
    </div>
  );
};

export default NotFound;
