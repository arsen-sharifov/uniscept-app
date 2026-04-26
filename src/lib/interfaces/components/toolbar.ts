import type { LucideIcon } from 'lucide-react';

export type TToolKind = 'mode' | 'action';

export interface IToolItem {
  id: string;
  icon: LucideIcon;
  label?: string;
  description?: string;
  shortcut?: string;
  kind?: TToolKind;
  disabled?: boolean;
}

export interface IToolGroup {
  id: string;
  label?: string;
  tools: IToolItem[];
}
