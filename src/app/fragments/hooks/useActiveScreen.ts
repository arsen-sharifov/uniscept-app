'use client';

import { type RefObject, useEffect, useState } from 'react';

import { LANDING_SCREEN_SELECTOR, SCREEN_CENTER_LINE_MARGIN } from '../consts';

export const useActiveScreen = (containerRef: RefObject<HTMLElement | null>): number => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const screens = [...container.querySelectorAll<HTMLElement>(LANDING_SCREEN_SELECTOR)];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = screens.indexOf(entry.target as HTMLElement);
          if (entry.isIntersecting) {
            entry.target.classList.add('on-screen');
            if (index >= 0) setActiveIndex(index);

            return;
          }
          entry.target.classList.remove('on-screen');
        });
      },
      { root: container, rootMargin: SCREEN_CENTER_LINE_MARGIN },
    );

    screens.forEach((screen) => observer.observe(screen));

    return () => observer.disconnect();
  }, [containerRef]);

  return activeIndex;
};
