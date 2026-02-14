import Link from 'next/link';
import { useTranslations } from '@/lib/hooks';

export const Hero = () => {
  const t = useTranslations();

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16">
      <div className="noise-texture absolute inset-0 -z-10" />
      <div className="dot-pattern absolute inset-0 -z-10" />

      <div className="pointer-events-none absolute top-[10%] left-[5%] h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[5%] bottom-[15%] h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-cyan-400/10 to-emerald-400/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl text-center">
        <div className="animate-fade-in-up mb-8">
          <h1 className="mb-6 text-7xl leading-[1.05] font-black tracking-tight text-black sm:text-8xl lg:text-[9rem]">
            {t.landing.hero.title}
            <br />
            <span className="gradient-text-animated">
              {t.landing.hero.titleAccent}
            </span>
          </h1>
        </div>

        <div className="animate-fade-in-up">
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-black/60 sm:text-2xl">
            {t.landing.hero.subtitle1}
            <br />
            {t.landing.hero.subtitle2}
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-xl font-bold text-black sm:text-2xl">
            {t.landing.hero.tagline}
          </p>
        </div>

        <div className="animate-fade-in-up mt-12 flex items-center justify-center gap-4">
          <Link
            href="/get-started"
            className="group relative overflow-hidden rounded-xl bg-black px-8 py-3.5 text-base font-semibold text-white shadow-2xl transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-emerald-500/25"
          >
            <span className="relative z-10">{t.landing.hero.ctaPrimary}</span>
            <div className="animate-shimmer absolute inset-0" />
          </Link>
          <button
            onClick={() =>
              document
                .getElementById('problem')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            className="cursor-pointer rounded-xl border-2 border-black/10 bg-white px-8 py-3.5 text-base font-semibold text-black backdrop-blur-sm transition-all duration-300 ease-in-out hover:scale-105 hover:border-black/20 hover:shadow-xl"
          >
            {t.landing.hero.ctaSecondary}
          </button>
        </div>

        <div data-reveal className="scroll-reveal mt-24">
          <div className="relative mx-auto max-w-4xl">
            <div className="absolute top-0 -left-20 h-32 w-32 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 opacity-20 blur-xl" />
            <div className="absolute -right-20 bottom-0 h-32 w-32 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
};
