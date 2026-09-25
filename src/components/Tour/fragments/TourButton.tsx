'use client';

import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

import type { TTourButtonSize, TTourButtonVariant } from '@interfaces';

import { TOUR_BUTTON_SIZES, TOUR_BUTTON_VARIANTS } from '../consts';

interface ITourButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: TTourButtonVariant;
  size?: TTourButtonSize;
}

export const TourButton = ({ variant, size = 'sm', type = 'button', className, ...rest }: ITourButtonProps) => (
  <button
    type={type}
    {...rest}
    className={clsx(
      'cursor-pointer rounded-lg py-1.5 font-grotesk font-medium duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none disabled:cursor-wait disabled:opacity-50 motion-reduce:transition-none',
      TOUR_BUTTON_VARIANTS[variant],
      TOUR_BUTTON_SIZES[size],
      className,
    )}
  />
);
