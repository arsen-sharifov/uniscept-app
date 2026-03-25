import type { LucideIcon } from 'lucide-react';
import type { IPreferences } from '../preferences';

export type TSettingsSection =
  | 'profile'
  | 'security'
  | 'notifications'
  | 'appearance'
  | 'editor'
  | 'plan';

export interface ISettingsSidebarItem {
  id: TSettingsSection;
  icon: LucideIcon;
}

export interface ISettingsSidebarGroup {
  labelKey: 'account' | 'preferences' | 'subscription';
  items: ISettingsSidebarItem[];
}

export interface IThemeOption {
  value: IPreferences['theme'];
  icon: LucideIcon;
  labelKey: 'themeLight' | 'themeDark' | 'themeSystem';
}
