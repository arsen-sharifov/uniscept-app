import { clsx } from 'clsx';
import type { LabelHTMLAttributes } from 'react';

export const AuthLabel = ({ className, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    {...rest}
    className={clsx(
      'block font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--hero-ground-muted)] uppercase',
      className,
    )}
  />
);
