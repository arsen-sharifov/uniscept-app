'use client';

import { clsx } from 'clsx';
import { AlertCircle, Check, CloudOff, Loader2, RotateCw } from 'lucide-react';
import { useFormatter } from 'next-intl';
import { useEffect, useState } from 'react';

import type { ISaveState } from '@interfaces';

import { useTranslations } from '@/i18n';
import { discardFailed, retryFailed, subscribeFailedOperations } from '@/lib/canvas';

import { ARIA_LABEL_KEY_BY_STATUS, SAVE_STATUS_REFRESH_INTERVAL_MS } from '../consts';

interface ISaveStatusProps {
  state: ISaveState;
}

export const SaveStatus = ({ state }: ISaveStatusProps) => {
  const t = useTranslations();
  const formatter = useFormatter();
  const [now, setNow] = useState(() => Date.now());
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => subscribeFailedOperations((operations) => setFailedCount(operations.length)), []);

  useEffect(() => {
    if (state.status !== 'saved' || !state.lastSavedAt) return;

    const id = window.setInterval(() => setNow(Date.now()), SAVE_STATUS_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [state.status, state.lastSavedAt]);

  if (state.status === 'idle') {
    return null;
  }

  return (
    <div
      role={state.status === 'error' ? 'alert' : 'status'}
      aria-live={state.status === 'error' ? 'assertive' : 'polite'}
      aria-label={t.platform.canvas.save[ARIA_LABEL_KEY_BY_STATUS[state.status] ?? 'saving']}
      className={clsx(
        'absolute bottom-4 left-4 z-30 flex max-w-[calc(100vw-8rem)] flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border px-3 py-1.5 text-[11px] font-medium tracking-tight backdrop-blur-md transition-colors duration-200',
        (state.status === 'saving' || state.status === 'retrying') &&
          'pointer-events-none border-[color:var(--border)] bg-[color:var(--surface)]/85 text-[color:var(--text)] shadow-[0_4px_12px_-6px_rgba(15,23,42,0.18)]',
        state.status === 'saved' &&
          'pointer-events-none border-[color:var(--status-success-border)] bg-[color:var(--status-success-bg)] text-[color:var(--status-success)] shadow-[0_4px_12px_-6px_var(--status-success-soft)]',
        state.status === 'offline' &&
          'pointer-events-none border-[color:var(--status-warning-border)] bg-[color:var(--status-warning-bg)] text-[color:var(--status-warning)] shadow-[0_4px_12px_-6px_var(--status-warning-soft)]',
        state.status === 'error' &&
          'border-[color:var(--status-error-border)] bg-[color:var(--status-error-bg)] text-[color:var(--status-error)] shadow-[0_4px_14px_-6px_var(--status-error-soft)]',
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
              <span className="ml-1 text-[color:var(--text-muted)]">{`· ${t('platform.canvas.save.retryAttempt', { n: state.retryAttempt })}`}</span>
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
              <span className="ml-1 opacity-70">
                {`· ${formatter.relativeTime(state.lastSavedAt, { now, style: 'narrow' })}`}
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
              <span className="ml-1 opacity-75">{`· ${t('platform.canvas.save.offlinePending', { count: state.pendingCount })}`}</span>
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
                <span className="ml-1 opacity-70">{`· ${t('platform.canvas.save.errorChanges', { count: failedCount })}`}</span>
              )}
            </span>
          </span>

          <span className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={retryFailed}
              className="inline-flex items-center gap-1 rounded-full bg-[color:var(--status-error-soft)] px-2 py-0.5 transition-colors hover:bg-[color:var(--status-error-border)]"
              aria-label={t.platform.canvas.save.retryAriaLabel}
            >
              <RotateCw className="h-2.5 w-2.5" strokeWidth={2.25} />
              {t.platform.canvas.save.retry}
            </button>

            <button
              type="button"
              onClick={discardFailed}
              className="inline-flex items-center rounded-full px-2 py-0.5 opacity-70 transition-[background-color,opacity] hover:bg-[color:var(--status-error-soft)] hover:opacity-100"
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
