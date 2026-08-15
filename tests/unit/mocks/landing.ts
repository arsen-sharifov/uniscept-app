import type { IHeroClaim, IHeroEdge } from '@interfaces';

import { setElementLayout } from './browser';

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
