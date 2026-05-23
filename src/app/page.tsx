'use client';

import { LANDING_THEME } from '@constants';
import { useScrollReveal } from '@hooks';

import {
  Hero,
  ProblemSection,
  ProductSection,
  BuildersSection,
  HowItWorksSection,
  PricingSection,
  CTASection,
} from './fragments';
import { Header, Footer } from './fragments/components';

const LandingPage = () => {
  useScrollReveal();

  return (
    <div data-theme={LANDING_THEME} className="min-h-screen bg-white">
      <Header />
      <Hero />
      <ProblemSection />
      <ProductSection />
      <BuildersSection />
      <HowItWorksSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
