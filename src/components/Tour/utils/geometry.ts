'use client';

import type { ISize, ITourGeometry } from '@interfaces';

import { sameRect, sameRects } from '@/lib/onboarding';

import { SCROLLING_OVERFLOW_VALUES } from '../consts';

export const readViewport = (): ISize => ({ width: window.innerWidth, height: window.innerHeight });

export const isInside = (inner: DOMRect, outer: DOMRect): boolean =>
  inner.top >= outer.top && inner.bottom <= outer.bottom && inner.left >= outer.left && inner.right <= outer.right;

export const isScrolledIntoView = (element: Element, box = element.getBoundingClientRect()): boolean => {
  const parent = element.parentElement;
  if (!parent) return box.top >= 0 && box.bottom <= window.innerHeight;

  if (!SCROLLING_OVERFLOW_VALUES.has(getComputedStyle(parent).overflowY)) return isScrolledIntoView(parent, box);

  const bounds = parent.getBoundingClientRect();

  return box.top >= bounds.top && box.bottom <= bounds.bottom && isScrolledIntoView(parent, box);
};

export const sameGeometry = (first: ITourGeometry, second: ITourGeometry): boolean =>
  first.anchor === second.anchor &&
  sameRect(first.rect, second.rect) &&
  sameRect(first.blocked, second.blocked) &&
  sameRects(first.lit, second.lit) &&
  sameRects(first.open, second.open);
