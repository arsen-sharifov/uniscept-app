'use client';

import { useEffect } from 'react';

import type { TTourAnchor } from '@interfaces';

import { findAnchorElement } from '@/lib/onboarding';
import { useCanvasStore } from '@/lib/stores';

import { isInside } from '../utils';

export const useAnchorInView = (anchor: TTourAnchor | null) => {
  const requestFit = useCanvasStore((state) => state.requestFit);

  useEffect(() => {
    if (!anchor) return;

    const element = findAnchorElement(anchor);
    if (!element) return;

    const canvas = element.closest('[data-tour="canvas"]');
    const box = element.getBoundingClientRect();

    if (canvas) {
      if (canvas !== element && !isInside(box, canvas.getBoundingClientRect())) requestFit();

      return;
    }

    if (box.top >= 0 && box.bottom <= window.innerHeight) return;

    element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [anchor, requestFit]);
};
