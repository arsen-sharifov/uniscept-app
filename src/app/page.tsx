'use client';

import { Header, Footer } from './fragments/components';
import {
  Hero,
  ProblemSection,
  ProductSection,
  BuildersSection,
  HowItWorksSection,
  PricingSection,
  CTASection,
} from './fragments';
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
