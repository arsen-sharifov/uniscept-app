'use client';

import { useMemo } from 'react';

import { useTranslations } from '@/i18n';
import { mergePlansWithTranslations } from '@/lib/pricing';

import { PricingCard, Section, SectionHeading, TiltPanel } from './components';

export const PricingSection = () => {
  const t = useTranslations();
  const plans = useMemo(() => mergePlansWithTranslations(t), [t]);

  return (
    <Section ground="deep">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <SectionHeading title={t.landing.pricing.title} subtitle={t.landing.pricing.subtitle} />
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <TiltPanel key={plan.id}>
              <PricingCard plan={plan} />
            </TiltPanel>
          ))}
        </div>

        <p className="mt-8 font-mono-ui text-[11px] tracking-[0.04em] text-[color:var(--hero-ground-muted)]">
          {t.landing.pricing.footer}
        </p>
      </div>
    </Section>
  );
};
