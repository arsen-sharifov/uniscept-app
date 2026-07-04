import type { ReactNode } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from '@/components/Toast';

interface IEventBoundaryProps {
  children: ReactNode;
}

export const EventBoundary = ({ children }: IEventBoundaryProps) => (
  <>
    {children}
    <ErrorBoundary fallback={null}>
      <Toaster />
    </ErrorBoundary>
  </>
);
