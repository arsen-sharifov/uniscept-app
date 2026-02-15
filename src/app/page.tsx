'use client';

import { Header, Footer } from '@/components/layout';
import { Hero } from './fragments/Hero';
import { ProblemSection } from './fragments/ProblemSection';
import { ProductSection } from './fragments/ProductSection';
import { BuildersSection } from './fragments/BuildersSection';
import { HowItWorksSection } from './fragments/HowItWorksSection';
import { PricingSection } from './fragments/PricingSection';
import { CTASection } from './fragments/CTASection';
import { useScrollReveal } from '@/lib/hooks';

export default function LandingPage() {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-white">
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
}
