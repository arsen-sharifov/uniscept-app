'use client';

import { useTranslations } from '@/i18n';

const PlatformPage = () => {
  const t = useTranslations();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <span
        aria-hidden
        className="h-2 w-2 rounded-full bg-[color:var(--accent)] opacity-70 shadow-[0_0_10px_var(--accent-glow)]"
      />
      <p className="font-mono-ui text-[11px] tracking-[0.06em] text-[color:var(--text-muted)] lowercase">
        {t.platform.sidebar.emptyState}
      </p>
    </div>
  );
};

export default PlatformPage;
