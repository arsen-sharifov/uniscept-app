'use client';

import { useEffect } from 'react';

import type { TTourAnchor } from '@interfaces';

import { findAnchorElement } from '@/lib/onboarding';
import { useCanvasStore } from '@/lib/stores';

import { CANVAS_ANCHOR_SELECTOR } from '../consts';
import { isInside } from '../utils';

export const useAnchorInCanvasView = (anchor: TTourAnchor | null) => {
  const requestFit = useCanvasStore((state) => state.requestFit);

  useEffect(() => {
    if (!anchor) return;

    const element = findAnchorElement(anchor);
    const canvas = element?.closest(CANVAS_ANCHOR_SELECTOR);
    if (!element || !canvas || canvas === element) return;

    if (!isInside(element.getBoundingClientRect(), canvas.getBoundingClientRect())) requestFit();
  }, [anchor, requestFit]);
};
