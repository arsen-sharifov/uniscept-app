'use client';

import { clsx } from 'clsx';
import type { ReactNode, Ref } from 'react';

import { LANDING_THEME } from '@constants';

import { useWorldArrival } from '../hooks';
import { AuroraField } from './AuroraField';

interface ILandingWorldProps {
  ref?: Ref<HTMLDivElement>;
  className?: string;
  children: ReactNode;
}

export const LandingWorld = ({ ref, className, children }: ILandingWorldProps) => {
  const arrival = useWorldArrival();

  return (
    <div
      ref={ref}
      data-theme={LANDING_THEME}
      data-field-in={arrival.field || undefined}
      data-world-ready={arrival.content || undefined}
      className={clsx('landing-world', className)}
    >
      {children}
      <AuroraField />
    </div>
  );
};
