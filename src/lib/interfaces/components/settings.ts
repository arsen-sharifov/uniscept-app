import type { LucideIcon } from 'lucide-react';

import type { TCanvasPattern, TTheme } from '@interfaces';

export type TSettingsSection = 'profile' | 'security' | 'notifications' | 'appearance' | 'editor' | 'plan';

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export type TSettingsGroupLabel = 'account' | 'preferences' | 'subscription';

export type TThemeLabelKey = `theme${Capitalize<TTheme>}`;

export type TThemeDescriptionKey = `${TTheme}Desc`;

export type TCanvasPatternLabelKey = `pattern${Capitalize<TCanvasPattern>}`;

export type TCanvasPatternDescriptionKey = `${TCanvasPatternLabelKey}Desc`;

export interface ISettingsSidebarItem {
  id: TSettingsSection;
  icon: LucideIcon;
}

export interface ISettingsSidebarGroup {
  labelKey: TSettingsGroupLabel;
  items: ISettingsSidebarItem[];
}

export interface IThemeOption {
  value: TTheme;
  icon: LucideIcon;
  labelKey: TThemeLabelKey;
  descriptionKey: TThemeDescriptionKey;
}

export interface ICanvasPatternOption {
  value: TCanvasPattern;
  icon: LucideIcon;
  labelKey: TCanvasPatternLabelKey;
  descriptionKey: TCanvasPatternDescriptionKey;
}
