'use client';

import { useEffect, useRef, useState } from 'react';

import { TICKER_DURATION_MS } from '../consts';
import { useReducedMotion } from '../hooks';

interface ITickerNumberProps {
  value: number;
}

export const TickerNumber = ({ value }: ITickerNumberProps) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [progress, setProgress] = useState(1);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = spanRef.current;
    if (!element || reducedMotion) return;

    let frame: number | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();

        const startedAt = performance.now();
        const step = (now: number) => {
          const elapsed = Math.min((now - startedAt) / TICKER_DURATION_MS, 1);
          setProgress(1 - Math.pow(1 - elapsed, 3));
          if (elapsed < 1) frame = requestAnimationFrame(step);
        };
        setProgress(0);
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [value, reducedMotion]);

  return (
    <span ref={spanRef} className="tabular-nums">
      {reducedMotion ? value : Math.round(value * progress)}
    </span>
  );
};
