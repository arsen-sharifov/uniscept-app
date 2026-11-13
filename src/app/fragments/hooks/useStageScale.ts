'use client';

import { type RefObject, useEffect, useState } from 'react';

import { HERO_STAGE_DESIGN_WIDTH_PX } from '../consts';

export const useStageScale = (frameRef: RefObject<HTMLElement | null>): number => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const observer = new ResizeObserver(() => {
      if (frame.clientWidth === 0) return;

      setScale(Math.min(1, frame.clientWidth / HERO_STAGE_DESIGN_WIDTH_PX));
    });
    observer.observe(frame);

    return () => observer.disconnect();
  }, [frameRef]);

  return scale;
};
