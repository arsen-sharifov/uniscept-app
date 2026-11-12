'use client';

import { useCallback, useEffect } from 'react';

import type { TTourAnchor } from '@interfaces';
import { REDUCED_MOTION_QUERY } from '@constants';
import { useViewportChange } from '@hooks';
import { findAnchorElement } from '@/lib/onboarding';

import { CANVAS_ANCHOR_SELECTOR } from '../consts';
import { isScrolledIntoView } from '../utils';

export const useAnchorInView = (anchor: TTourAnchor | null) => {
  const reveal = useCallback(() => {
    if (!anchor) return;

    const element = findAnchorElement(anchor);
    if (!element || element.closest(CANVAS_ANCHOR_SELECTOR) || isScrolledIntoView(element)) return;

    element.scrollIntoView({
      block: 'nearest',
      behavior: window.matchMedia(REDUCED_MOTION_QUERY).matches ? 'instant' : 'smooth',
    });
  }, [anchor]);

  useEffect(() => reveal(), [reveal]);

  useViewportChange({ onResize: reveal, enabled: anchor !== null });
};
