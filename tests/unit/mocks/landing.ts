import type { IHeroClaim, IHeroEdge, IPricingPlan } from '@interfaces';

import { setElementLayout } from './browser';
import { TRANSLATIONS } from './i18n';

export const heroClaim = (id: IHeroClaim['id'], overrides: Partial<IHeroClaim> = {}): IHeroClaim => ({
  id,
  code: id,
  kind: 'statement',
  status: 'valid',
  x: 0,
  y: 0,
  width: 10,
  ...overrides,
});

export const heroEdge = (source: string, target: string): IHeroEdge => ({ id: `${source}-${target}`, source, target });

export const landingPager = () => {
  const container = document.createElement('div');
  setElementLayout(container, { clientHeight: 600 });

  [0, 600].forEach((offsetTop) => {
    const screen = document.createElement('section');
    screen.className = 'snap-start';
    setElementLayout(screen, { offsetTop, offsetHeight: 600 });
    container.append(screen);
  });

  return { container, ref: { current: container } };
};

export const HERO_EDGES = [heroEdge('q', 'p1'), heroEdge('q', 'missing')];

export const HERO_QUESTION_RECT = { x: 0, y: 0, width: 100, height: 40 };

export const HERO_PREMISE_RECT = { x: 200, y: 160, width: 100, height: 40 };

export const VIGNETTE_INTERVAL_MS = 1000;

export const LANDING_SCREEN_LABELS = [
  TRANSLATIONS.landing.header.logo,
  TRANSLATIONS.landing.problem.title,
  TRANSLATIONS.landing.product.title,
  TRANSLATIONS.landing.builders.title,
  TRANSLATIONS.landing.howItWorks.title,
  TRANSLATIONS.landing.pricing.title,
  TRANSLATIONS.landing.cta.title2,
];

export const DEMO_PLAN: IPricingPlan = {
  id: 'demo',
  price: 'free',
  href: '/platform',
  disabled: true,
  name: TRANSLATIONS.landing.pricing.plans.demo.name,
  features: TRANSLATIONS.landing.pricing.plans.demo.features,
};
