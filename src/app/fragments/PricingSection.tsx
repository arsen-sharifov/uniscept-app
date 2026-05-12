import { useMemo } from 'react';
import { useTranslations } from '@hooks';
import { mergePlansWithTranslations } from '@/lib/pricing';
import { PricingCard, Section } from './components';

export const PricingSection = () => {
  const t = useTranslations();
  const plans = useMemo(() => mergePlansWithTranslations(t), [t]);

  return (
    <Section className="py-28">
      <div className="absolute top-1/2 right-[10%] h-96 w-96 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 blur-3xl" />

      <div className="mx-auto max-w-7xl">
        <div data-reveal className="scroll-reveal mb-16 text-center">
          <h2 className="mb-6 text-5xl font-black tracking-tight text-black sm:text-6xl">{t.landing.pricing.title}</h2>
          <p className="text-xl text-black/60">{t.landing.pricing.subtitle}</p>
        </div>

        <div data-reveal className="scroll-reveal grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-black/50">{t.landing.pricing.footer}</p>
      </div>
    </Section>
  );
};
