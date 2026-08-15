'use client';

import { useLayoutEffect, useRef } from 'react';

import { attachAurora, detachAurora } from '../utils';

export const AuroraField = () => {
  const slotRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;

    attachAurora(slot);

    return detachAurora;
  }, []);

  return <div ref={slotRef} className="landing-aurora-slot contents" />;
};
