import type { THeroMiniTone, TLandingTranslations } from '@interfaces';

export const buildScreenLabels = (landing: TLandingTranslations): string[] => [
  landing.header.logo,
  landing.problem.title,
  landing.product.title,
  landing.builders.title,
  landing.howItWorks.title,
  landing.pricing.title,
  landing.cta.title2,
];

export const buildToneLabels = (landing: TLandingTranslations): Record<THeroMiniTone, string> => ({
  question: landing.hero.demo.statusQuestion,
  answer: landing.hero.demo.statusAnswer,
  valid: landing.hero.demo.statusValid,
  refuted: landing.hero.demo.statusRefuted,
  affected: landing.hero.demo.statusAffected,
  reference: landing.product.vignettes.referencesBadge,
  open: landing.hero.demo.statusClaim,
});
