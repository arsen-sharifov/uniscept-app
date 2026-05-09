'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Check, CloudOff, Loader2, RotateCw } from 'lucide-react';
import { clsx } from 'clsx';
import type { ISaveState } from '@interfaces';
import { useTranslations } from '@hooks';
import { discardFailed, retryFailed, subscribeFailedOperations } from '@/lib/canvas';
import { interpolate } from '@/lib/utils';
import { SAVE_STATUS_REFRESH_INTERVAL_MS } from '../consts';
import { formatRelativeTime } from '../utils';

interface ISaveStatusProps {
  state: ISaveState;
}

export const SaveStatus = ({ state }: ISaveStatusProps) => {
  const t = useTranslations();
  const [now, setNow] = useState(() => Date.now());
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => subscribeFailedOperations((operations) => setFailedCount(operations.length)), []);

  useEffect(() => {
    if (state.status !== 'saved' || !state.lastSavedAt) return;

    const id = window.setInterval(() => setNow(Date.now()), SAVE_STATUS_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [state.status, state.lastSavedAt]);

  if (state.status === 'idle') return null;

  return (
    <div
      role={state.status === 'error' ? 'alert' : 'status'}
      aria-live={state.status === 'error' ? 'assertive' : 'polite'}
      className={clsx(
        'absolute bottom-4 left-4 z-30 flex max-w-[calc(100vw-8rem)] flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border px-3 py-1.5 text-[11px] font-medium tracking-tight backdrop-blur-md transition-colors duration-200',
        (state.status === 'saving' || state.status === 'retrying') &&
          'pointer-events-none border-black/[0.06] bg-white/85 text-neutral-600 shadow-[0_4px_12px_-6px_rgba(15,23,42,0.18)]',
        state.status === 'saved' &&
          'pointer-events-none border-emerald-500/15 bg-emerald-500/[0.08] text-emerald-700 shadow-[0_4px_12px_-6px_rgba(16,185,129,0.25)]',
        state.status === 'offline' &&
          'pointer-events-none border-amber-500/25 bg-amber-500/[0.10] text-amber-700 shadow-[0_4px_12px_-6px_rgba(245,158,11,0.25)]',
        state.status === 'error' &&
          'border-red-500/25 bg-red-500/[0.10] text-red-700 shadow-[0_4px_14px_-6px_rgba(239,68,68,0.32)]'
      )}
    >
      {state.status === 'saving' && (
        <>
          <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none" strokeWidth={2.25} />
          <span>{t.platform.canvas.save.saving}</span>
        </>
      )}

      {state.status === 'retrying' && (
        <>
          <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none" strokeWidth={2.25} />
          <span>
            {t.platform.canvas.save.retrying}
            {state.retryAttempt > 0 && (
              <span className="ml-1 text-neutral-500">
                {`· ${interpolate(t.platform.canvas.save.retryAttempt, {
                  n: state.retryAttempt,
                })}`}
              </span>
            )}
          </span>
        </>
      )}

      {state.status === 'saved' && (
        <>
          <Check className="h-3 w-3" strokeWidth={2.5} />
          <span>
            {t.platform.canvas.save.saved}
            {state.lastSavedAt && (
              <span className="ml-1 text-emerald-700/55">
                {`· ${formatRelativeTime(state.lastSavedAt, now, t.platform.canvas.save.relativeTime)}`}
              </span>
            )}
          </span>
        </>
      )}

      {state.status === 'offline' && (
        <>
          <CloudOff className="h-3 w-3" strokeWidth={2.25} />
          <span>
            {t.platform.canvas.save.offline}
            {state.pendingCount > 0 && (
              <span className="ml-1 text-amber-700/70">
                {`· ${interpolate(t.platform.canvas.save.offlinePending, {
                  count: state.pendingCount,
                })}`}
              </span>
            )}
          </span>
        </>
      )}

      {state.status === 'error' && (
        <>
          <span className="flex items-center gap-1.5">
            <AlertCircle className="h-3 w-3" strokeWidth={2.25} />
            <span>
              {t.platform.canvas.save.errorTitle}
              {failedCount > 0 && (
                <span className="ml-1 text-red-700/65">
                  {`· ${interpolate(
                    failedCount === 1 ? t.platform.canvas.save.errorChange : t.platform.canvas.save.errorChanges,
                    { count: failedCount }
                  )}`}
                </span>
              )}
            </span>
          </span>

          <span className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={retryFailed}
              className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-red-700 transition-colors hover:bg-red-500/20"
              aria-label={t.platform.canvas.save.retryAriaLabel}
            >
              <RotateCw className="h-2.5 w-2.5" strokeWidth={2.25} />
              {t.platform.canvas.save.retry}
            </button>

            <button
              type="button"
              onClick={discardFailed}
              className="inline-flex items-center rounded-full px-2 py-0.5 text-red-700/70 transition-colors hover:bg-red-500/10 hover:text-red-700"
              aria-label={t.platform.canvas.save.discardAriaLabel}
            >
              {t.platform.canvas.save.discard}
            </button>
          </span>
        </>
      )}
    </div>
  );
};
