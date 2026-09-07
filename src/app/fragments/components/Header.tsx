'use client';

import Link from 'next/link';

import { useTranslations } from '@/i18n';

export const Header = () => {
  const t = useTranslations();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-[color:var(--hero-hairline)] bg-[color:var(--hero-header-veil)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <button
            type="button"
            onClick={() => document.getElementById('top')?.scrollIntoView({ block: 'start' })}
            className="cursor-pointer font-grotesk text-[22px] font-extrabold tracking-[-0.02em] text-[color:var(--hero-title)] transition-opacity hover:opacity-80"
          >
            {t.landing.header.logo}
          </button>
          <nav className="flex items-center gap-6">
            <Link
              href="/login"
              className="font-mono-ui text-[11.5px] font-bold tracking-[0.12em] text-[color:var(--hero-ground-text)] uppercase transition-colors duration-200 hover:text-[color:var(--hero-title)]"
            >
              {t.landing.header.signIn}
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-[color:var(--hero-lime)] px-4 py-2.5 font-mono-ui text-[11.5px] font-bold tracking-[0.12em] text-[color:var(--hero-lime-ink)] uppercase transition-colors duration-200 hover:bg-[color:var(--hero-lime-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--hero-lime-glow)] focus-visible:outline-none"
            >
              {t.landing.header.getStarted}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
