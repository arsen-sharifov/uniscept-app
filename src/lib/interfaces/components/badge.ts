import type { LucideIcon } from 'lucide-react';

export interface IBadgePip {
  id: string;
  icon: LucideIcon;
  label: string;
  earned: boolean;
}
