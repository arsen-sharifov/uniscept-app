'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { ISaveState } from '../sync';

interface ISaveStatusProps {
  state: ISaveState;
}

const formatRelative = (timestamp: number, now: number) => {
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
};

export const SaveStatus = ({ state }: ISaveStatusProps) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (state.status !== 'saved' || !state.lastSavedAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, [state.status, state.lastSavedAt]);

  if (state.status === 'idle') return null;

  const isSaving = state.status === 'saving';
  const isError = state.status === 'error';
  const isSaved = state.status === 'saved';

  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        'pointer-events-none absolute bottom-4 left-4 z-30 flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-tight backdrop-blur-md transition-colors duration-200',
        isSaving &&
          'border-black/[0.06] bg-white/85 text-neutral-600 shadow-[0_4px_12px_-6px_rgba(15,23,42,0.18)]',
        isSaved &&
          'border-emerald-500/15 bg-emerald-500/[0.08] text-emerald-700 shadow-[0_4px_12px_-6px_rgba(16,185,129,0.25)]',
        isError &&
          'border-red-500/20 bg-red-500/[0.08] text-red-700 shadow-[0_4px_12px_-6px_rgba(239,68,68,0.25)]'
      )}
    >
      {isSaving && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2.25} />
          <span>Saving…</span>
        </>
      )}
      {isSaved && (
        <>
          <Check className="h-3 w-3" strokeWidth={2.5} />
          <span>
            Saved
            {state.lastSavedAt && (
              <span className="ml-1 text-emerald-700/55">
                · {formatRelative(state.lastSavedAt, now)}
              </span>
            )}
          </span>
        </>
      )}
      {isError && (
        <>
          <AlertCircle className="h-3 w-3" strokeWidth={2.25} />
          <span>Couldn&rsquo;t save changes</span>
        </>
      )}
    </div>
  );
};
