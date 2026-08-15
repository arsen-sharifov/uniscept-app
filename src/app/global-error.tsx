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
      <body className="flex min-h-screen items-center justify-center bg-[#eef4f0] px-6 font-sans text-[#0c1210] antialiased">
        <div className="relative flex w-full max-w-sm flex-col items-center gap-2 overflow-hidden rounded-xl border border-[rgba(13,19,16,0.09)] bg-[#ffffff] px-6 py-7 text-center shadow-[0_24px_60px_-28px_rgba(13,19,16,0.22)]">
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[#dc2626]" />

          <p className="text-base font-semibold">Something broke</p>
          <p className="max-w-xs text-sm leading-relaxed text-[rgba(13,19,16,0.6)]">
            An unexpected error occurred. You can try again.
          </p>

          <button
            type="button"
            onClick={reset}
            className="mt-2 cursor-pointer rounded-lg bg-[#4ade80] px-4 py-2 text-sm font-medium text-[#06130c] shadow-[0_10px_28px_-12px_rgba(22,163,74,0.28)] transition-[background-color,translate] duration-200 ease-out hover:bg-[#86efac] focus-visible:ring-2 focus-visible:ring-[rgba(22,163,74,0.45)] focus-visible:outline-none active:translate-y-px motion-reduce:transition-none"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
