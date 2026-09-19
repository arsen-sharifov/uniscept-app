'use client';

import { useEffect } from 'react';

import type { TTourAnchor } from '@interfaces';
import { TOUR_FOCUS_ATTRIBUTE } from '@constants';
import { findAnchorElement } from '@/lib/onboarding';

export const useAnchorFocus = (anchor: TTourAnchor | null) => {
  useEffect(() => {
    if (!anchor) return;

    const element = findAnchorElement(anchor);
    if (!element) return;

    element.setAttribute(TOUR_FOCUS_ATTRIBUTE, '');

    return () => element.removeAttribute(TOUR_FOCUS_ATTRIBUTE);
  }, [anchor]);
};
