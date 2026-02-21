import Link from 'next/link';
import { useTranslations } from '@/lib/hooks';

export const Header = () => {
  const t = useTranslations();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-xl transition-all duration-300 ease-in-out">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="gradient-text-animated cursor-pointer text-2xl font-black tracking-tight transition-opacity hover:opacity-80"
          >
            {t.landing.header.logo}
          </button>
          <nav className="flex items-center gap-8">
            <Link
              href="/login"
              className="text-base font-medium text-black/60 transition-all duration-300 ease-in-out hover:text-black"
            >
              {t.landing.header.login}
            </Link>
            <Link
              href="/get-started"
              className="group relative overflow-hidden rounded-lg bg-black px-6 py-2.5 text-base font-medium text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
            >
              <span className="relative z-10">
                {t.landing.header.getStarted}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-500 opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100" />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
