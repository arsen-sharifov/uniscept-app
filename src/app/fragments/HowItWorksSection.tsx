import clsx from 'clsx';
import { Section } from './components';
import { STEPS } from '@/lib/constants/content';
import { useTranslations } from '@/lib/hooks';

export const HowItWorksSection = () => {
  const t = useTranslations();

  return (
    <Section>
      <div className="mx-auto max-w-5xl">
        <div data-reveal className="scroll-reveal mb-20 text-center">
          <h2 className="mb-6 text-5xl font-black tracking-tight text-black sm:text-6xl">
            {t.landing.howItWorks.title}
          </h2>
          <p className="text-xl text-black/60">
            {t.landing.howItWorks.subtitle}
          </p>
        </div>

        <div data-reveal className="scroll-reveal">
          <div className="space-y-12">
            {STEPS.map((step) => (
              <div key={step.number} className="group relative flex gap-6">
                <div
                  className={clsx(
                    'relative z-10 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-2xl font-black text-white shadow-xl transition-all duration-300 ease-in-out group-hover:scale-110',
                    step.color
                  )}
                >
                  {step.number}
                </div>
                <div className="flex-1 rounded-xl border border-black/5 bg-white p-6 shadow-xl transition-all duration-300 ease-in-out group-hover:border-emerald-500/20 group-hover:shadow-2xl">
                  <h3 className="mb-2 text-2xl font-black text-black">
                    {step.title}
                  </h3>
                  <p className="text-lg leading-relaxed text-black/60">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};
