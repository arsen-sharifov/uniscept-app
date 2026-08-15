import {
  AtSign,
  Bell,
  Contrast,
  CreditCard,
  Flame,
  Grid3x3,
  Grip,
  Mail,
  MessageSquare,
  Minus,
  Moon,
  MoonStar,
  Palette,
  PenTool,
  Plus,
  Shield,
  Sun,
  SunMedium,
  Sunrise,
  User,
  UserPlus,
  Waves,
} from 'lucide-react';

import type { ICanvasPatternOption, ISettingsSidebarGroup, IThemeOption } from '@interfaces';

export const SIDEBAR_GROUPS = [
  {
    labelKey: 'account',
    items: [
      { id: 'profile', icon: User },
      { id: 'security', icon: Shield },
    ],
  },
  {
    labelKey: 'preferences',
    items: [
      { id: 'notifications', icon: Bell },
      { id: 'appearance', icon: Palette },
      { id: 'editor', icon: PenTool },
    ],
  },
  {
    labelKey: 'subscription',
    items: [{ id: 'plan', icon: CreditCard }],
  },
] as const satisfies readonly ISettingsSidebarGroup[];

export const THEMES: readonly IThemeOption[] = [
  {
    value: 'daybreak',
    icon: Sunrise,
    labelKey: 'themeDaybreak',
    descriptionKey: 'daybreakDesc',
    systemPair: true,
  },
  {
    value: 'eclipse',
    icon: Moon,
    labelKey: 'themeEclipse',
    descriptionKey: 'eclipseDesc',
    systemPair: true,
  },
  { value: 'graphite', icon: Sun, labelKey: 'themeGraphite', descriptionKey: 'graphiteDesc' },
  { value: 'solstice', icon: Contrast, labelKey: 'themeSolstice', descriptionKey: 'solsticeDesc' },
  { value: 'aurora', icon: Flame, labelKey: 'themeAurora', descriptionKey: 'auroraDesc' },
  { value: 'tide', icon: Waves, labelKey: 'themeTide', descriptionKey: 'tideDesc' },
  { value: 'orchid', icon: MoonStar, labelKey: 'themeOrchid', descriptionKey: 'orchidDesc' },
  { value: 'bloom', icon: SunMedium, labelKey: 'themeBloom', descriptionKey: 'bloomDesc' },
];

export const CANVAS_PATTERNS = [
  { value: 'dots', icon: Grip, labelKey: 'patternDots', descriptionKey: 'patternDotsDesc' },
  { value: 'lines', icon: Grid3x3, labelKey: 'patternLines', descriptionKey: 'patternLinesDesc' },
  { value: 'cross', icon: Plus, labelKey: 'patternCross', descriptionKey: 'patternCrossDesc' },
  { value: 'none', icon: Minus, labelKey: 'patternNone', descriptionKey: 'patternNoneDesc' },
] as const satisfies readonly ICanvasPatternOption[];

export const NOTIFICATION_ITEMS = [
  { icon: AtSign, labelKey: 'mentions', descriptionKey: 'mentionsDescription' },
  { icon: MessageSquare, labelKey: 'comments', descriptionKey: 'commentsDescription' },
  { icon: UserPlus, labelKey: 'invites', descriptionKey: 'invitesDescription' },
  { icon: Mail, labelKey: 'digest', descriptionKey: 'digestDescription' },
] as const;

export const AVAILABLE_PLAN_IDS: readonly string[] = ['demo'];

export const SETTINGS_SKELETON_AVATAR_TILES = 21;

export const SETTINGS_SKELETON_BADGE_TILES = 14;

export const SETTINGS_SKELETON_BADGE_DOTS = 6;

export const SETTINGS_SKELETON_PLAN_CARDS = 4;
