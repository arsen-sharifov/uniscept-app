import type { TAvatarSize } from '@interfaces';

export const SIZE_CLASS: Record<TAvatarSize, string> = {
  xs: 'h-6 w-6 text-[9px]',
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
};

export const GLYPH_SIZE_PX: Record<TAvatarSize, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 32,
  xl: 46,
};

export const PRESENCE_CLASS: Record<TAvatarSize, string> = {
  xs: 'h-1.5 w-1.5 border',
  sm: 'h-2 w-2 border-2',
  md: 'h-2.5 w-2.5 border-2',
  lg: 'h-3 w-3 border-2',
  xl: 'h-4 w-4 border-2',
};
