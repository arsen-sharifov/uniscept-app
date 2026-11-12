import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import type { TLandingSectionGround } from '@interfaces';

import { LANDING_SECTION_GROUND_CLASSES } from '../consts';

interface ISectionProps {
  id?: string;
  ground?: TLandingSectionGround;
  isScreen?: boolean;
  tight?: boolean;
  children: ReactNode;
  className?: string;
}

export const Section = ({
  id,
  ground = 'field',
  isScreen = true,
  tight = false,
  children,
  className,
}: ISectionProps) => (
  <section
    id={id}
    className={clsx(
      'relative z-[1] flex flex-col justify-center overflow-hidden border-t border-[color:var(--hero-hairline-soft)] px-landing-rail',
      tight ? 'pt-5 pb-11' : 'pt-12 pb-20 lg:pt-14 lg:pb-24',
      isScreen ? 'landing-screen min-h-[calc(100svh-var(--landing-header-height))]' : 'flex-1',
      LANDING_SECTION_GROUND_CLASSES[ground],
      className,
    )}
  >
    {children}
  </section>
);
