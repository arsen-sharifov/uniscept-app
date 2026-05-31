'use client';

import { clsx } from 'clsx';

import type { TDefaultZoom } from '@interfaces';
import { DEFAULT_ZOOM_VALUES } from '@constants';

interface IZoomStackProps {
  value: TDefaultZoom;
  onChange: (value: TDefaultZoom) => void;
  label: string;
}

export const ZoomStack = ({ value, onChange, label }: IZoomStackProps) => (
  <div
    role="radiogroup"
    aria-label={label}
    className="flex items-stretch gap-1.5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-1.5"
  >
    {DEFAULT_ZOOM_VALUES.map((option) => {
      const isActive = option === value;

      return (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={isActive}
          onClick={() => onChange(option)}
          className={clsx(
            'group relative flex-1 cursor-pointer rounded-xl py-2.5 text-[13px] font-semibold tracking-tight tabular-nums',
            'transition-[background-color,color,transform] duration-200 ease-out',
            'focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none',
            isActive
              ? 'bg-[color:var(--accent)] text-[color:var(--on-accent)] shadow-[0_8px_22px_-12px_var(--accent-glow)]'
              : 'text-[color:var(--text-muted)] hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text)]',
          )}
        >
          <span className="inline-flex items-baseline justify-center gap-px">
            {option}
            <span className="text-[9px] tracking-wider opacity-70">%</span>
          </span>
          <span
            aria-hidden
            className={clsx(
              'pointer-events-none absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[color:var(--accent)] transition-opacity duration-300',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
          />
        </button>
      );
    })}
  </div>
);
