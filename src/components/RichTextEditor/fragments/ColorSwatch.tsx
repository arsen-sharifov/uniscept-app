'use client';

import { clsx } from 'clsx';

interface IColorSwatchProps {
  label: string;
  color: string;
  selected: boolean;
  onClick: () => void;
}

export const ColorSwatch = ({ label, color, selected, onClick }: IColorSwatchProps) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={selected}
    title={label}
    onClick={onClick}
    style={{ color }}
    className={clsx(
      'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-grotesk text-[13px] leading-none font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none motion-reduce:transition-none',
      selected
        ? 'bg-[color:var(--surface-overlay)] ring-1 ring-[color:var(--border-strong)] ring-inset'
        : 'hover:bg-[color:var(--surface-overlay)]',
    )}
  >
    <span aria-hidden>A</span>
  </button>
);
