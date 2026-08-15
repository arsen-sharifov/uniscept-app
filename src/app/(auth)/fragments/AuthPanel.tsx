import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import { LANDING_SURFACE_CLASSES } from '@/app/fragments/consts';

interface IAuthPanelProps {
  className?: string;
  children: ReactNode;
}

export const AuthPanel = ({ className, children }: IAuthPanelProps) => (
  <div className={clsx(LANDING_SURFACE_CLASSES.sheet, 'p-8', className)}>{children}</div>
);
