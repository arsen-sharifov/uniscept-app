import type { ReactNode } from 'react';

export interface IShowcaseItem {
  label: string;
  hint?: string;
  description?: string;
  span?: boolean;
  children: ReactNode;
}
