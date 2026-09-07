import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

export const AuthButton = ({ type = 'button', className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type={type}
    {...rest}
    className={clsx(
      'cursor-pointer rounded-lg bg-[color:var(--hero-lime)] py-2.5 font-grotesk text-sm font-bold tracking-tight text-[color:var(--hero-lime-ink)] shadow-[0_12px_36px_-10px_var(--hero-lime-glow)] transition-colors duration-200 hover:bg-[color:var(--hero-lime-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--hero-lime-glow)] focus-visible:outline-none active:bg-[color:var(--hero-lime)] disabled:cursor-not-allowed disabled:bg-[color:var(--hero-chip-bg)] disabled:text-[color:var(--hero-ground-muted)] disabled:shadow-none disabled:hover:bg-[color:var(--hero-chip-bg)]',
      className,
    )}
  />
);
