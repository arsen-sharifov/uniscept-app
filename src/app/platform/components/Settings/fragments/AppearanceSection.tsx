'use client';

import { clsx } from 'clsx';
import { Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition, type CSSProperties } from 'react';

import type { IPreferences, TCanvasPattern, TLocale, TPreferenceUpdater, TTheme } from '@interfaces';

import { useTranslations, LOCALES, setLocale } from '@/i18n';
import { event } from '@/lib/events';

import { CANVAS_PATTERNS, THEMES } from '../consts';
import { SettingsSwitch } from '../SettingsSwitch';

const resolveLocaleStatus = (pending: boolean, errored: boolean, saving: string, failed: string): string => {
  if (pending) return saving;
  if (errored) return failed;

  return '';
};

interface IAppearanceSectionProps {
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
      } catch (error) {
        event.error(error, { toast: false, context: 'settings.setLocale' });
        onUpdate('language', previous);
        setErrored(true);
      }
    });
  };

  const followsSystem = preferences.theme === 'auto';

  const handleThemeChange = (next: TTheme) => {
    if (next === preferences.theme) {
      return;
    }

    onUpdate('theme', next);
  };

  const handleFollowSystemChange = (next: boolean) => {
    if (next) {
      onUpdate('theme', 'auto');

      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    onUpdate('theme', prefersDark ? 'eclipse' : 'daybreak');
  };

  const handlePatternChange = (next: TCanvasPattern) => {
    if (next === preferences.canvasPattern) {
      return;
    }

    onUpdate('canvasPattern', next);
  };

  return (
    <div className="space-y-4">
      <section>
        <header className="mb-3 flex items-center justify-between">
          <h3 className="font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--text-label)] uppercase">
            {appearance.language}
          </h3>
          <span
            className={clsx(
              'flex h-5 w-5 items-center justify-center text-[color:var(--accent-text)] transition-opacity duration-150 motion-reduce:transition-none',
              pending ? 'opacity-100 delay-150' : 'opacity-0',
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
                  'group relative flex items-center gap-2.5 rounded-xl border px-3 py-1.5 text-left transition-[border-color,background-color,transform] duration-200 ease-out',
                  'focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)] focus-visible:outline-none',
                  'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
                  pending ? 'cursor-wait' : 'cursor-pointer hover:-translate-y-px active:translate-y-0',
                  isActive
                    ? 'border-[color:var(--border-active)] bg-[color:var(--accent-soft)]'
                    : 'border-[color:var(--border)] bg-[color:var(--surface-elevated)]',
                  !isActive &&
                    !pending &&
                    'hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-overlay)]',
                )}
              >
                <span
                  aria-hidden
                  className={clsx(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono-ui text-[10.5px] font-semibold tracking-[0.06em] transition-colors duration-200 ease-out motion-reduce:transition-none',
                    isActive
                      ? 'bg-[color:var(--accent-soft)] text-[color:var(--accent-text)]'
                      : 'bg-[color:var(--surface-overlay)] text-[color:var(--text-muted)]',
                  )}
                >
                  {value.toUpperCase()}
                </span>

                <span
                  className={clsx(
                    'min-w-0 flex-1 truncate text-[13px] font-medium tracking-tight transition-colors duration-200 ease-out motion-reduce:transition-none',
                    isActive ? 'text-[color:var(--accent-text)]' : 'text-[color:var(--text)]',
                  )}
                >
                  {appearance.languages[value]}
                </span>

                <span
                  aria-hidden={!isActive}
                  className={clsx(
                    'flex h-4 w-4 shrink-0 items-center justify-center text-[color:var(--accent-text)] transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
                    isActive ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
                  )}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="border-t border-[color:var(--border)] pt-2.5">
        <header className="mb-1 flex items-baseline justify-between">
          <h3 className="font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--text-label)] uppercase">
            {appearance.theme}
          </h3>
          <span className="font-mono-ui text-[10px] tracking-[0.14em] text-[color:var(--text-label)] uppercase">
            {appearance.themeIntro}
          </span>
        </header>
        <p className="mb-3 max-w-lg text-[12.5px] leading-relaxed text-[color:var(--text-muted)]">
          {appearance.themeBlurb}
        </p>
        <div
          className={clsx(
            'mb-3 flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-[border-color,background-color] duration-200 ease-out motion-reduce:transition-none',
            followsSystem
              ? 'border-[color:var(--border-active)] bg-[color:var(--accent-soft)]'
              : 'border-[color:var(--border)] bg-[color:var(--surface-elevated)]',
          )}
        >
          <span
            data-theme="auto"
            aria-hidden
            style={{ '--swatch-height': '2.25rem' } as CSSProperties}
            className="theme-swatch block w-20 shrink-0 rounded-md border border-[color:var(--border-strong)]"
          >
            <span className="theme-swatch__sky" />
            <span className="theme-swatch__grid" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block font-grotesk text-[14px] leading-tight font-semibold tracking-tight text-[color:var(--text-strong)]">
              {appearance.themeAuto}
            </span>
            <span className="block font-mono-ui text-[10px] font-bold tracking-[0.04em] text-[color:var(--text-label)] uppercase">
              {appearance.autoDesc}
            </span>
          </span>

          <SettingsSwitch checked={followsSystem} label={appearance.themeAuto} onChange={handleFollowSystemChange} />
        </div>
        <div role="radiogroup" aria-label={appearance.theme} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {THEMES.map(({ value, labelKey, descriptionKey, systemPair, icon: Icon }) => {
            const isActive = value === preferences.theme;
            const isPaired = followsSystem && systemPair === true;

            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => handleThemeChange(value)}
                className={clsx(
                  'group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border text-left transition-[border-color,background-color,transform,box-shadow] duration-200 ease-out',
                  'hover:-translate-y-0.5 active:translate-y-0',
                  'focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-panel)] focus-visible:outline-none',
                  'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
                  isActive && 'border-[color:var(--border-active)] bg-[color:var(--accent-soft)]',
                  isPaired && !isActive && 'border-dashed border-[color:var(--border-active)]',
                  !isActive &&
                    !isPaired &&
                    'border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-card-hover)]',
                )}
              >
                <span
                  data-theme={value}
                  aria-hidden
                  className="theme-swatch block w-full border-b border-[color:var(--border)]"
                >
                  <span className="theme-swatch__sky" />
                  <span className="theme-swatch__grid" />
                  <span className="theme-swatch__pip" />
                  <span className="absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--surface)] text-[color:var(--text-strong)] shadow-[var(--shadow-pip)] ring-1 ring-[color:var(--border-strong)] transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:scale-100">
                    <Icon className="h-3 w-3" strokeWidth={2.25} />
                  </span>
                </span>

                <span
                  className={clsx(
                    'flex flex-col gap-0.5 px-3 pt-2 pb-2.5',
                    !isActive && 'bg-[color:var(--surface-elevated)]',
                  )}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-grotesk text-[14px] leading-none font-semibold tracking-tight text-[color:var(--text-strong)]">
                      {appearance[labelKey]}
                    </span>
                    <span
                      aria-hidden={!isActive}
                      className={clsx(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-[color:var(--on-accent)] shadow-[var(--shadow-pip)] transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
                        isActive ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
                      )}
                    >
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                  </span>
                  <span className="font-mono-ui text-[10px] font-bold tracking-[0.04em] text-[color:var(--text-label)] uppercase">
                    {appearance[descriptionKey]}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="border-t border-[color:var(--border)] pt-2.5">
        <header className="mb-1 flex items-baseline justify-between">
          <h3 className="font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--text-label)] uppercase">
            {appearance.canvas}
          </h3>
          <span className="font-mono-ui text-[10px] tracking-[0.14em] text-[color:var(--text-label)] uppercase">
            {appearance.canvasIntro}
          </span>
        </header>
        <p className="mb-3 max-w-lg text-[12.5px] leading-relaxed text-[color:var(--text-muted)]">
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
                  'group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border text-left transition-[border-color,background-color,transform,box-shadow] duration-200 ease-out',
                  'hover:-translate-y-0.5 active:translate-y-0',
                  'focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)] focus-visible:outline-none',
                  'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
                  isActive
                    ? 'border-[color:var(--border-active)] bg-[color:var(--accent-soft)]'
                    : 'border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-card-hover)]',
                )}
              >
                <div
                  data-pattern={value}
                  aria-hidden
                  className="pattern-swatch w-full border-b border-[color:var(--border)]"
                >
                  <div className="pattern-swatch__sky" />
                  <div className="pattern-swatch__grid" />
                  <span className="absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--surface-elevated)] text-[color:var(--text-strong)] shadow-[var(--shadow-pip)] ring-1 ring-[color:var(--border-strong)] transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:scale-100">
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </span>
                </div>

                <div
                  className={clsx(
                    'flex flex-col gap-0.5 px-3 pt-2 pb-2.5',
                    !isActive && 'bg-[color:var(--surface-elevated)]',
                  )}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-grotesk text-[14px] leading-none font-semibold tracking-tight text-[color:var(--text-strong)]">
                      {appearance[labelKey]}
                    </span>
                    <span
                      aria-hidden={!isActive}
                      className={clsx(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-[color:var(--on-accent)] shadow-[var(--shadow-pip)] transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
                        isActive ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
                      )}
                    >
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                  </div>
                  <span className="font-mono-ui text-[10px] font-bold tracking-[0.04em] text-[color:var(--text-label)] uppercase">
                    {appearance[descriptionKey]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
