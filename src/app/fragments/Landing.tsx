'use client';

import { useRef } from 'react';

import { useTranslations } from '@/i18n';

import { BuildersSection } from './BuildersSection';
import { Footer, Header, HeroEdgeMarkers, LandingWorld, SectionRail } from './components';
import { LANDING_SCREEN_SELECTOR } from './consts';
import { CTASection } from './CTASection';
import { Hero } from './Hero';
import { useActiveScreen, useSnapPager } from './hooks';
import { HowItWorksSection } from './HowItWorksSection';
import { PricingSection } from './PricingSection';
import { ProblemSection } from './ProblemSection';
import { ProductSection } from './ProductSection';
import { buildScreenLabels } from './utils';

export const Landing = () => {
  const t = useTranslations();
  const containerRef = useRef<HTMLDivElement>(null);
  useSnapPager(containerRef);
  const activeIndex = useActiveScreen(containerRef);

  const screenLabels = buildScreenLabels(t.landing);

  const selectScreen = (index: number) => {
    const screens = containerRef.current?.querySelectorAll(LANDING_SCREEN_SELECTOR);
    screens?.[index]?.scrollIntoView({ block: 'start' });
  };

  return (
    <LandingWorld
      ref={containerRef}
      className="h-svh scroll-pt-(--landing-header-height) overflow-y-auto scroll-smooth motion-reduce:scroll-auto"
    >
      <div aria-hidden className="landing-grain pointer-events-none fixed inset-0 noise-texture" />
      <HeroEdgeMarkers />

      <Header />
      <SectionRail labels={screenLabels} activeIndex={activeIndex} onSelect={selectScreen} />
      <Hero />
      <ProblemSection />
      <ProductSection />
      <BuildersSection />
      <HowItWorksSection />
      <PricingSection />
      <div className="landing-screen relative z-[1] flex min-h-[calc(100svh-var(--landing-header-height))] flex-col">
        <CTASection />
        <Footer />
      </div>
    </LandingWorld>
  );
};
