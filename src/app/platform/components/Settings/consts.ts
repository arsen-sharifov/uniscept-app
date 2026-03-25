import {
  Bell,
  CreditCard,
  Monitor,
  Moon,
  Palette,
  PenTool,
  Shield,
  Sun,
  User,
} from 'lucide-react';
import type {
  IPreferences,
  ISettingsSidebarGroup,
  IThemeOption,
} from '@interfaces';

export const SIDEBAR_GROUPS: ISettingsSidebarGroup[] = [
  {
    labelKey: 'account',
    items: [
      { id: 'profile', icon: User },
      { id: 'security', icon: Shield },
      { id: 'notifications', icon: Bell },
    ],
  },
  {
    labelKey: 'preferences',
    items: [
      { id: 'appearance', icon: Palette },
      { id: 'editor', icon: PenTool },
    ],
  },
  {
    labelKey: 'subscription',
    items: [{ id: 'plan', icon: CreditCard }],
  },
];

export const THEMES: IThemeOption[] = [
  { value: 'light', icon: Sun, labelKey: 'themeLight' },
  { value: 'dark', icon: Moon, labelKey: 'themeDark' },
  { value: 'system', icon: Monitor, labelKey: 'themeSystem' },
];

export const ZOOM_OPTIONS = [50, 75, 100, 125, 150];

export const STORAGE_KEY = 'uniscept-preferences';

export const DEFAULT_PREFERENCES: IPreferences = {
  theme: 'light',
  snapToGrid: false,
  showGrid: true,
  showMinimap: false,
  defaultZoom: 100,
  emailMentions: true,
  emailComments: true,
  emailInvites: true,
  emailDigest: true,
};
