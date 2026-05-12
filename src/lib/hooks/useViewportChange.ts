'use client';

import { useEffect } from 'react';

interface IUseViewportChangeOptions {
  onScroll?: () => void;
  onResize?: () => void;
  enabled?: boolean;
  capture?: boolean;
}

export const useViewportChange = ({
  onScroll,
  onResize,
  enabled = true,
  capture = false,
}: IUseViewportChangeOptions): void => {
  useEffect(() => {
    if (!enabled) return;
    if (!onScroll && !onResize) return;

    if (onScroll) window.addEventListener('scroll', onScroll, capture);
    if (onResize) window.addEventListener('resize', onResize, capture);

    return () => {
      if (onScroll) window.removeEventListener('scroll', onScroll, capture);
      if (onResize) window.removeEventListener('resize', onResize, capture);
    };
  }, [onScroll, onResize, enabled, capture]);
};
