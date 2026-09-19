'use client';

import type { ISize, ITourGeometry } from '@interfaces';

import { sameRect, sameRects } from '@/lib/onboarding';

export const readViewport = (): ISize => ({ width: window.innerWidth, height: window.innerHeight });

export const isInside = (inner: DOMRect, outer: DOMRect): boolean =>
  inner.top >= outer.top && inner.bottom <= outer.bottom && inner.left >= outer.left && inner.right <= outer.right;

export const sameGeometry = (a: ITourGeometry, b: ITourGeometry): boolean =>
  a.anchor === b.anchor &&
  sameRect(a.rect, b.rect) &&
  sameRect(a.blocked, b.blocked) &&
  sameRects(a.lit, b.lit) &&
  sameRects(a.open, b.open);
