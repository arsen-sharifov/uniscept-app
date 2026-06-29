import { useState } from 'react';

import { ErrorBoundary, ErrorFallback } from '@/components';

import { CrashingChild } from './CrashingChild';

export const CrashDemo = () => {
  const [explode, setExplode] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const handleReset = () => {
    setExplode(false);
    setAttempt((current) => current + 1);
  };

  return (
    <div className="flex w-80 flex-col gap-3">
      <button
        type="button"
        onClick={() => setExplode(true)}
        className="self-start rounded-xl border border-[color:var(--status-error-border)] bg-[color:var(--status-error-bg)] px-3.5 py-2 text-[13px] font-medium text-[color:var(--status-error)]"
      >
        Crash the render
      </button>
      <div className="h-40">
        <ErrorBoundary key={attempt} fallback={<ErrorFallback onReset={handleReset} />}>
          <CrashingChild explode={explode} />
        </ErrorBoundary>
      </div>
    </div>
  );
};
