import {
  Bell,
  Contrast,
  CreditCard,
  Grid3x3,
  Grip,
  Minus,
  Moon,
  Palette,
  PenTool,
  Pencil,
  Plus,
  Shield,
  Sparkles,
  Sunrise,
  Sunset,
  User,
} from 'lucide-react';

import type { ICanvasPatternOption, ISettingsSidebarGroup, IThemeOption, TTheme } from '@interfaces';

export const SIDEBAR_GROUPS = [
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
] as const satisfies readonly ISettingsSidebarGroup[];

export const THEMES = [
  { value: 'daybreak', icon: Sunrise, labelKey: 'themeDaybreak', descriptionKey: 'daybreakDesc' },
  { value: 'eclipse', icon: Moon, labelKey: 'themeEclipse', descriptionKey: 'eclipseDesc' },
  { value: 'graphite', icon: Pencil, labelKey: 'themeGraphite', descriptionKey: 'graphiteDesc' },
  { value: 'solstice', icon: Sunset, labelKey: 'themeSolstice', descriptionKey: 'solsticeDesc' },
  { value: 'aurora', icon: Sparkles, labelKey: 'themeAurora', descriptionKey: 'auroraDesc' },
  { value: 'auto', icon: Contrast, labelKey: 'themeAuto', descriptionKey: 'autoDesc' },
] as const satisfies readonly IThemeOption[];

export const CANVAS_PATTERNS = [
  { value: 'dots', icon: Grip, labelKey: 'patternDots', descriptionKey: 'patternDotsDesc' },
  { value: 'lines', icon: Grid3x3, labelKey: 'patternLines', descriptionKey: 'patternLinesDesc' },
  { value: 'cross', icon: Plus, labelKey: 'patternCross', descriptionKey: 'patternCrossDesc' },
  { value: 'none', icon: Minus, labelKey: 'patternNone', descriptionKey: 'patternNoneDesc' },
] as const satisfies readonly ICanvasPatternOption[];

export const ZOOM_OPTIONS = [50, 75, 100, 125, 150] as const;

export const THEME_SWATCH_BADGE: Record<TTheme, string> = {
  daybreak: 'bg-white text-neutral-900 ring-black/10',
  eclipse: 'bg-slate-900 text-cyan-200 ring-cyan-300/25',
  graphite: 'bg-neutral-900 text-neutral-50 ring-white/15',
  solstice: 'bg-amber-50 text-amber-950 ring-amber-900/15',
  aurora: 'bg-violet-50 text-violet-950 ring-violet-900/15',
  auto: 'bg-zinc-100 text-zinc-900 ring-zinc-900/12',
};
