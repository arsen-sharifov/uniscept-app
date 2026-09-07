'use client';

import { clsx } from 'clsx';
import type { ComponentType } from 'react';

import type { TProductFeatureId } from '@interfaces';

import { useTranslations } from '@/i18n';

import {
  CollaborationVignette,
  ReferencesVignette,
  Section,
  SectionHeading,
  StructuredVignette,
  TiltPanel,
  ValidationVignette,
} from './components';
import { LANDING_SURFACE_CLASSES, PRODUCT_FEATURES } from './consts';

const PRODUCT_VIGNETTES: Record<TProductFeatureId, ComponentType> = {
  structured: StructuredVignette,
  validation: ValidationVignette,
  references: ReferencesVignette,
  collaboration: CollaborationVignette,
};

export const ProductSection = () => {
  const t = useTranslations();

  return (
    <Section id="product" tight>
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 max-w-3xl">
          <SectionHeading title={t.landing.product.title} subtitle={t.landing.product.subtitle1}>
            <p className="mt-2 font-grotesk text-lg font-semibold text-[color:var(--hero-ground-text)] lg:text-xl">
              {t.landing.product.subtitle2}
            </p>
          </SectionHeading>
        </div>

        <div className="grid gap-4 lg:grid-cols-12">
          {PRODUCT_FEATURES.map((feature) => {
            const Vignette = PRODUCT_VIGNETTES[feature.id];

            return (
              <TiltPanel key={feature.id} className={feature.span}>
                <article className={clsx(LANDING_SURFACE_CLASSES.panel, 'h-full p-6')}>
                  <Vignette />
                  <h3 className="mt-4 font-grotesk text-lg font-semibold tracking-tight text-[color:var(--hero-title)]">
                    {t.landing.product.features[feature.id].title}
                  </h3>
                  <p className="mt-1.5 font-grotesk text-[14px] leading-normal text-[color:var(--hero-ground-muted)]">
                    {t.landing.product.features[feature.id].description}
                  </p>
                </article>
              </TiltPanel>
            );
          })}
        </div>
      </div>
    </Section>
  );
};
