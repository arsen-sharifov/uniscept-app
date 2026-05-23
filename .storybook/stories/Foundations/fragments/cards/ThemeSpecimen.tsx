import { clsx } from 'clsx';
import { ArrowUpRight, Check, MessageCircle, Sparkles } from 'lucide-react';

import type { IThemeMeta } from '@story-interfaces';

import { ThemedSurface } from '../layout';
import { Copyable, StatusPip } from '../widgets';

interface IThemeSpecimenProps {
  theme: IThemeMeta;
  size: 'hero' | 'tile';
}

export const ThemeSpecimen = ({ theme, size }: IThemeSpecimenProps) => {
  const isHero = size === 'hero';

  return (
    <ThemedSurface
      themeId={theme.id}
      className={clsx('flex flex-col', isHero ? 'min-h-[460px] px-8 pt-7 pb-8' : 'min-h-[260px] px-5 pt-5 pb-6')}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: isHero
            ? `radial-gradient(70% 55% at 82% 8%, var(--accent-glow), transparent 60%), radial-gradient(55% 45% at 14% 100%, color-mix(in oklab, var(--accent-2) 24%, transparent), transparent 70%)`
            : `radial-gradient(80% 60% at 78% 8%, var(--accent-glow), transparent 65%)`,
          opacity: isHero ? 0.85 : 0.55,
        }}
      />

      <header className="relative flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span
            className={clsx(
              'font-mono font-semibold tracking-[0.24em] text-[color:var(--text-subtle)] uppercase',
              isHero ? 'text-[10.5px]' : 'text-[9.5px]',
            )}
          >
            {theme.id}
          </span>
          <span
            className={clsx(
              'font-mono tracking-[0.18em] text-[color:var(--text-faint)] uppercase',
              isHero ? 'text-[10px]' : 'text-[9px]',
            )}
          >
            · {theme.mode}
          </span>
        </div>
        <Copyable value={`[data-theme="${theme.id}"]`} display="copy attr" />
      </header>

      <h3
        className={clsx(
          'relative mt-3 font-serif leading-[1] tracking-[-0.015em] text-[color:var(--text-strong)] italic',
          isHero ? 'text-[44px]' : 'text-[28px]',
        )}
      >
        {theme.name}
      </h3>
      <p
        className={clsx(
          'relative mt-2 leading-snug text-[color:var(--text-muted)]',
          isHero ? 'max-w-[420px] text-[13px]' : 'text-[11.5px]',
        )}
      >
        {theme.caption}.
      </p>

      <div className={clsx('relative flex flex-wrap items-center gap-1.5', isHero ? 'mt-6' : 'mt-4')}>
        <span
          className="inline-flex items-center gap-1 rounded-full bg-[color:var(--accent)] px-2.5 py-1 text-[11px] font-medium tracking-tight text-[color:var(--on-accent)]"
          style={{ boxShadow: '0 8px 18px -10px var(--accent-glow)' }}
        >
          <Sparkles className="h-3 w-3" strokeWidth={2.25} />
          Canvas
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] px-2 py-0.5 text-[10.5px] font-medium text-[color:var(--text)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] shadow-[0_0_0_2px_var(--accent-soft)]" />
          Live
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--ref-bg)] px-2 py-0.5 text-[10.5px] font-medium text-[color:var(--ref)] ring-1 ring-[color:var(--ref-border)]">
          <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={2.25} />
          Reference
        </span>
      </div>

      <div className={clsx('relative grid grid-cols-3 gap-1.5', isHero ? 'mt-5' : 'mt-3')}>
        <StatusPip label="Valid" tone="success" />
        <StatusPip label="Drift" tone="warning" />
        <StatusPip label="Broken" tone="error" />
      </div>

      {isHero && (
        <div className="relative mt-auto pt-6">
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[color:var(--text-strong)]">Premise</span>
              <Check className="h-3.5 w-3.5 text-[color:var(--accent)]" strokeWidth={2.5} />
            </div>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-[color:var(--text-muted)]">
              Reasoning visible, traceable, reusable across canvases and time.
            </p>
            <div className="mt-2.5 flex items-center gap-1.5 text-[color:var(--text-subtle)]">
              <MessageCircle className="h-3 w-3" strokeWidth={2} />
              <span className="font-mono text-[9px] tracking-[0.18em] uppercase">3 comments</span>
            </div>
          </div>
        </div>
      )}
    </ThemedSurface>
  );
};
