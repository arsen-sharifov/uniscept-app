'use client';

import { useEffect } from 'react';

import type { IRouteError } from '@interfaces';

import { ErrorFallback } from '@/components';
import { event } from '@/lib/events';

const RootError = ({ error, reset }: IRouteError) => {
  useEffect(() => {
    event.error(error, { toast: false, context: 'route.error' });
  }, [error]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[color:var(--app-bg)]">
      <ErrorFallback onReset={reset} />
    </div>
  );
};

export default RootError;
