'use client';

import { type RefObject, useCallback, useEffect, useState } from 'react';

import type { IAnchorRect, TTourPlacement } from '@interfaces';
import { useViewportChange } from '@hooks';

import { placeCard, readViewport } from '../utils';

export const useCardPosition = (
  cardRef: RefObject<HTMLElement | null>,
  rect: IAnchorRect | null,
  placement: TTourPlacement,
) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [viewport, setViewport] = useState(readViewport);

  const measureViewport = useCallback(() => setViewport(readViewport()), []);

  useViewportChange({ onResize: measureViewport });

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const observer = new ResizeObserver(() => setSize({ width: element.offsetWidth, height: element.offsetHeight }));
    observer.observe(element);

    return () => observer.disconnect();
  }, [cardRef]);

  return { ...placeCard(rect, placement, size, viewport), measured: size.width > 0 };
};
