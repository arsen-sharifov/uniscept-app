'use client';

import { XCircle } from 'lucide-react';
import { Fragment } from 'react';

import { useTranslations } from '@/i18n';

import { STREAM_DECISION_INDEX } from '../consts';

export const ThreadStream = () => {
  const t = useTranslations();

  return (
    <div className="landing-glass relative overflow-hidden rounded-xl border border-[color:var(--hero-card-border)] bg-[color:var(--hero-ground-deep)]/90 shadow-[var(--hero-stream-shadow)] backdrop-blur-sm">
      <div className="flex h-10 items-center gap-2 border-b border-[color:var(--hero-hairline)] px-3.5">
        <span className="h-2 w-2 rounded-full bg-[color:var(--hero-refuted)] shadow-[0_0_8px_var(--hero-refuted-glow)]" />
        <span className="font-mono-ui text-[10.5px] tracking-[0.04em] text-[color:var(--hero-ground-muted)] lowercase">
          {t.landing.problem.stream.channel} · {t.landing.problem.stream.live}
        </span>
      </div>

      <div className="relative h-[380px] overflow-hidden">
        <div className="stream-scroll absolute inset-x-0 top-0 px-4 pt-3">
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1 || undefined} className="flex flex-col gap-2.5 pb-2.5">
              {t.landing.problem.stream.lines.map((line, index) => (
                <Fragment key={`${copy}-${index}`}>
                  {index === STREAM_DECISION_INDEX && (
                    <p className="w-fit rounded bg-[color:var(--hero-lime)]/8 px-2 py-1 font-mono-ui text-[12.5px] leading-relaxed font-bold text-[color:var(--hero-accent-text)]">
                      <span aria-hidden>❯ </span>
                      {t.landing.problem.stream.decision}
                    </p>
                  )}
                  <p className="font-mono-ui text-[12.5px] leading-relaxed text-[color:var(--hero-ground-muted)]">
                    <span className="stream-prompt">{'>'}</span> {line}
                  </p>
                </Fragment>
              ))}
            </div>
          ))}
        </div>

        <div
          aria-hidden
          className="stream-fade--top pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[color:var(--hero-ground-deep)] to-transparent"
        />
        <div
          aria-hidden
          className="stream-fade--bottom pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[color:var(--hero-ground-deep)] to-transparent"
        />

        <span className="stream-stamp pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded border border-[color:var(--hero-refuted)]/45 bg-[color:var(--hero-refuted)]/12 px-2.5 py-1.5 font-mono-ui text-[11px] font-bold tracking-[0.16em] text-[color:var(--hero-refuted)] uppercase">
          <XCircle aria-hidden className="h-3 w-3 shrink-0" strokeWidth={2.5} />
          {t.landing.problem.stream.stamp}
        </span>
      </div>
    </div>
  );
};
