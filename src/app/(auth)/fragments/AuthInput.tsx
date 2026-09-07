import { clsx } from 'clsx';
import type { InputHTMLAttributes } from 'react';

export const AuthInput = ({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...rest}
    className={clsx(
      'w-full rounded-lg border border-[color:var(--hero-hairline-strong)] bg-[color:var(--hero-chip-bg)] px-4 py-2.5 text-sm text-[color:var(--hero-ground-text)] transition-colors duration-200 outline-none placeholder:text-[color:var(--hero-ground-muted)] hover:border-[color:var(--hero-rail)] focus:border-[color:var(--hero-lime)] focus-visible:ring-2 focus-visible:ring-[color:var(--hero-lime-glow)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-[color:var(--hero-hairline-strong)]',
      className,
    )}
  />
);
