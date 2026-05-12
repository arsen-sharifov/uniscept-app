'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { IPreferences, TCanvasPattern, TLocale, TPreferenceUpdater, TTheme } from '@interfaces';
import { useTranslations } from '@hooks';
import { LOCALES, setLocale } from '@/i18n';
import { CANVAS_PATTERNS, THEME_SWATCH_BADGE, THEMES } from '../consts';

const resolveLocaleStatus = (pending: boolean, errored: boolean, saving: string, failed: string): string => {
  if (pending) return saving;
  if (errored) return failed;

  return '';
};

export interface IAppearanceSectionProps {
  preferences: IPreferences;
  onUpdate: TPreferenceUpdater;
}

export const AppearanceSection = ({ preferences, onUpdate }: IAppearanceSectionProps) => {
  const t = useTranslations();
  const { appearance, languageSaving, languageSaveFailed } = t.platform.settings;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errored, setErrored] = useState(false);

  const handleLocaleChange = (next: TLocale) => {
    if (next === preferences.language || pending) {
      return;
    }

    const previous = preferences.language;
    setErrored(false);
    onUpdate('language', next);

    startTransition(async () => {
      try {
        await setLocale(next);
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('lang', next);
        }
        router.refresh();
      } catch {
        onUpdate('language', previous);
        setErrored(true);
      }
    });
  };

  const handleThemeChange = (next: TTheme) => {
    if (next === preferences.theme) {
      return;
    }

    onUpdate('theme', next);
  };

  const handlePatternChange = (next: TCanvasPattern) => {
    if (next === preferences.canvasPattern) {
      return;
    }

    onUpdate('canvasPattern', next);
  };

  return (
    <div className="space-y-8">
      <section>
        <header className="mb-4 flex items-center justify-between">
          <h3 className="text-[11px] font-semibold tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
            {appearance.language}
          </h3>
          <span
            className={clsx(
              'flex h-5 w-5 items-center justify-center text-[color:var(--accent)] transition-opacity duration-150',
              pending ? 'opacity-100 delay-150' : 'opacity-0'
            )}
            aria-hidden
          >
            <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none" strokeWidth={2} />
          </span>
        </header>

        <div role="status" aria-live="polite" className="sr-only">
          {resolveLocaleStatus(pending, errored, languageSaving, languageSaveFailed)}
        </div>

        <div aria-busy={pending} className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {LOCALES.map((value) => {
            const isActive = value === preferences.language;

            return (
              <button
                key={value}
                type="button"
                disabled={pending}
                onClick={() => handleLocaleChange(value)}
                aria-pressed={isActive}
                className={clsx(
                  'group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-[border-color,background-color,transform] duration-200 ease-out',
                  'hover:-translate-y-px',
                  'focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)] focus-visible:outline-none',
                  'disabled:cursor-wait disabled:hover:translate-y-0',
                  isActive
                    ? 'border-[color:var(--border-active)] bg-[color:var(--accent-soft)]'
                    : 'border-[color:var(--border)] bg-[color:var(--surface-elevated)] hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-overlay)]'
                )}
              >
                <span
                  aria-hidden
                  className={clsx(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-[10.5px] font-semibold tracking-[0.06em] transition-colors',
                    isActive
                      ? 'bg-[color:var(--accent-soft)] text-[color:var(--accent-text)]'
                      : 'bg-[color:var(--surface-overlay)] text-[color:var(--text-muted)]'
                  )}
                >
                  {value.toUpperCase()}
                </span>

                <span
                  className={clsx(
                    'min-w-0 flex-1 truncate text-[13px] font-medium tracking-tight transition-colors',
                    isActive ? 'text-[color:var(--accent-text)]' : 'text-[color:var(--text)]'
                  )}
                >
                  {appearance.languages[value]}
                </span>

                <span
                  aria-hidden={!isActive}
                  className={clsx(
                    'flex h-4 w-4 shrink-0 items-center justify-center text-[color:var(--accent)] transition-[opacity,transform] duration-300 ease-out',
                    isActive ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                  )}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="border-t border-[color:var(--border)] pt-6">
        <header className="mb-1 flex items-baseline justify-between">
          <h3 className="text-[11px] font-semibold tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
            {appearance.theme}
          </h3>
          <span className="text-[10.5px] tracking-[0.16em] text-[color:var(--text-faint)] uppercase">
            {appearance.themeIntro}
          </span>
        </header>
        <p className="mb-4 max-w-md text-[12.5px] leading-relaxed text-[color:var(--text-muted)]">
          {appearance.themeBlurb}
        </p>

        <div role="radiogroup" aria-label={appearance.theme} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {THEMES.map(({ value, labelKey, descriptionKey, icon: Icon }) => {
            const isActive = value === preferences.theme;
            const isAuto = value === 'auto';

            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => handleThemeChange(value)}
                className={clsx(
                  'group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-[border-color,transform,box-shadow] duration-300 ease-out',
                  'hover:-translate-y-0.5',
                  'focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)] focus-visible:outline-none',
                  isAuto && 'border-dashed',
                  isActive && 'border-[color:var(--border-active)] shadow-[0_18px_38px_-22px_var(--accent-glow)]',
                  !isActive &&
                    isAuto &&
                    'border-[color:var(--border-strong)] hover:border-[color:var(--text-subtle)] hover:shadow-[var(--shadow-card-hover)]',
                  !isActive &&
                    !isAuto &&
                    'border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-card-hover)]'
                )}
              >
                <div data-theme={value} aria-hidden className="theme-swatch w-full">
                  <div className="theme-swatch__sky" />
                  <div className="theme-swatch__grid" />
                  <div className="theme-swatch__pip" />
                  <span
                    className={`absolute top-2.5 left-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-[0_4px_10px_-2px_rgba(15,23,42,0.32),inset_0_1px_0_rgba(255,255,255,0.55)] ring-1 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-105 ${THEME_SWATCH_BADGE[value]}`}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </span>
                </div>

                <div className="flex flex-col gap-1 bg-[color:var(--surface-elevated)] px-3.5 pt-2.5 pb-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex min-w-0 items-baseline gap-2">
                      <span className="truncate font-serif text-[16px] leading-none tracking-tight text-[color:var(--text-strong)] italic">
                        {appearance[labelKey]}
                      </span>
                      {isAuto && (
                        <span className="font-mono text-[8.5px] leading-none font-semibold tracking-[0.22em] text-[color:var(--text-faint)] uppercase">
                          {appearance.defaultBadge}
                        </span>
                      )}
                    </div>

                    <span
                      aria-hidden={!isActive}
                      className={clsx(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-[color:var(--on-accent)] transition-[opacity,transform] duration-300 ease-out',
                        isActive ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                      )}
                    >
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                  </div>

                  <span className="text-[10.5px] font-medium tracking-[0.16em] text-[color:var(--text-subtle)] uppercase">
                    {appearance[descriptionKey]}
                  </span>
                </div>

                <span
                  aria-hidden
                  className={clsx(
                    'pointer-events-none absolute inset-x-0 bottom-0 h-px transition-opacity duration-300',
                    isActive
                      ? 'bg-gradient-to-r from-transparent via-[color:var(--accent)] to-transparent opacity-90'
                      : 'opacity-0'
                  )}
                />
              </button>
            );
          })}
        </div>
      </section>

      <section className="border-t border-[color:var(--border)] pt-6">
        <header className="mb-1 flex items-baseline justify-between">
          <h3 className="text-[11px] font-semibold tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
            {appearance.canvas}
          </h3>
          <span className="text-[10.5px] tracking-[0.16em] text-[color:var(--text-faint)] uppercase">
            {appearance.canvasIntro}
          </span>
        </header>
        <p className="mb-4 max-w-md text-[12.5px] leading-relaxed text-[color:var(--text-muted)]">
          {appearance.canvasBlurb}
        </p>

        <div role="radiogroup" aria-label={appearance.canvas} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CANVAS_PATTERNS.map(({ value, labelKey, descriptionKey, icon: Icon }) => {
            const isActive = value === preferences.canvasPattern;

            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => handlePatternChange(value)}
                className={clsx(
                  'group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-[border-color,transform,box-shadow] duration-300 ease-out',
                  'hover:-translate-y-0.5',
                  'focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)] focus-visible:outline-none',
                  isActive
                    ? 'border-[color:var(--border-active)] shadow-[0_18px_38px_-22px_var(--accent-glow)]'
                    : 'border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-card-hover)]'
                )}
              >
                <div data-pattern={value} aria-hidden className="pattern-swatch w-full">
                  <div className="pattern-swatch__sky" />
                  <div className="pattern-swatch__grid" />
                  <span className="absolute top-2.5 left-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--surface-elevated)] text-[color:var(--text-strong)] shadow-[0_4px_10px_-2px_rgba(15,23,42,0.32),inset_0_1px_0_rgba(255,255,255,0.55)] ring-1 ring-[color:var(--border-strong)] transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-105">
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </span>
                </div>

                <div className="flex flex-col gap-1 bg-[color:var(--surface-elevated)] px-3.5 pt-2.5 pb-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-serif text-[16px] leading-none tracking-tight text-[color:var(--text-strong)] italic">
                      {appearance[labelKey]}
                    </span>
                    <span
                      aria-hidden={!isActive}
                      className={clsx(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-[color:var(--on-accent)] transition-[opacity,transform] duration-300 ease-out',
                        isActive ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                      )}
                    >
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                  </div>
                  <span className="text-[10.5px] font-medium tracking-[0.16em] text-[color:var(--text-subtle)] uppercase">
                    {appearance[descriptionKey]}
                  </span>
                </div>

                <span
                  aria-hidden
                  className={clsx(
                    'pointer-events-none absolute inset-x-0 bottom-0 h-px transition-opacity duration-300',
                    isActive
                      ? 'bg-gradient-to-r from-transparent via-[color:var(--accent)] to-transparent opacity-90'
                      : 'opacity-0'
                  )}
                />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
