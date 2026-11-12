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

export const LANDING_HEADER_OFFSET_PX = 80;

export const COMPACT_HEADER_OFFSET_PX = 56;

export const TALL_SCREEN_HEIGHT_PX = 1400;

export const TALL_SCREEN_END_PX = 800;

const landingScreen = (offsetTop: number) => {
  const screen = document.createElement('section');
  screen.className = 'landing-screen';
  setElementLayout(screen, { offsetTop, offsetHeight: 600 });

  return screen;
};

export const landingPager = () => {
  const container = document.createElement('div');
  const screens = { first: landingScreen(0), second: landingScreen(600) };
  setElementLayout(container, { clientHeight: 600 });
  container.style.scrollPaddingTop = `${LANDING_HEADER_OFFSET_PX}px`;
  container.append(screens.first, screens.second);

  return { container, screens, ref: { current: container } };
};

export const stretchFirstScreen = ({ screens }: ReturnType<typeof landingPager>) => {
  setElementLayout(screens.first, { offsetHeight: TALL_SCREEN_HEIGHT_PX });
  setElementLayout(screens.second, { offsetTop: TALL_SCREEN_HEIGHT_PX });
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
