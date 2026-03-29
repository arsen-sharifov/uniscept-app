'use client';

import { useTranslations } from '@hooks';

const PlatformPage = () => {
  const t = useTranslations();

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <p className="text-sm text-black/30">{t.platform.sidebar.emptyState}</p>
    </div>
  );
};

export default PlatformPage;
