import { ErrorBoundary, ErrorFallback } from '@/components';

import { CrashingChild } from './CrashingChild';

export const CrashedBoundary = () => (
  <div data-visual-target className="h-40 w-80">
    <ErrorBoundary fallback={<ErrorFallback onReset={() => {}} />}>
      <CrashingChild explode />
    </ErrorBoundary>
  </div>
);
