import Link from 'next/link';
import { Section } from '@/components/ui';
import { useTranslations } from '@/lib/hooks';

export const CTASection = () => {
  const t = useTranslations();

  return (
    <Section>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />

      <div className="relative mx-auto max-w-5xl text-center">
        <div data-reveal className="scroll-reveal">
          <h2 className="mb-8 text-6xl leading-[1.1] font-black tracking-tight text-black sm:text-7xl">
            {t.landing.cta.title1}
            <br />
            <span className="gradient-text-animated">
              {t.landing.cta.title2}
            </span>
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-black/60">
            {t.landing.cta.subtitle}
          </p>
          <Link
            href="/get-started"
            className="inline-flex items-center justify-center rounded-xl bg-black px-10 py-5 text-lg font-bold text-white shadow-2xl transition-all duration-300 ease-in-out hover:scale-105 hover:bg-black/90"
          >
            {t.landing.cta.button}
          </Link>
        </div>
      </div>
    </Section>
  );
};
