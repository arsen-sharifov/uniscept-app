import type { LucideIcon } from 'lucide-react';

export interface IToolItem {
  id: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
}
