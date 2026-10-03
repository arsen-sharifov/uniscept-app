'use client';

import { ACCENT_GLOW_FALLBACK } from '../consts';
import { useThemeToken } from '../hooks';

export const ArrivalGlow = () => {
  const accentGlow = useThemeToken('--accent-glow', ACCENT_GLOW_FALLBACK);

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-30 animate-ref-arrival-glow motion-reduce:hidden"
        style={{
          background: `radial-gradient(ellipse at center, ${accentGlow} 0%, transparent 70%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-30 animate-ref-arrival-ring motion-reduce:hidden"
      />
    </>
  );
};
