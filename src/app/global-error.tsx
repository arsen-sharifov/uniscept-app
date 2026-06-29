'use client';

import { useEffect } from 'react';

import type { IRouteError } from '@interfaces';

import { event } from '@/lib/events';

const GlobalError = ({ error, reset }: IRouteError) => {
  useEffect(() => {
    event.error(error, { toast: false, context: 'route.global' });
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-8 text-center font-sans text-zinc-900 antialiased">
        <p className="text-base font-semibold">Something broke</p>
        <p className="max-w-sm text-sm text-zinc-500">An unexpected error occurred. You can try again.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-1 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Try again
        </button>
      </body>
    </html>
  );
};

export default GlobalError;
