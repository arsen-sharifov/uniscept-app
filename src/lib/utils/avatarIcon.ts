import type { TAvatarIcon } from '@interfaces';
import { AVATAR_ICONS } from '@constants';

export const isAvatarIcon = (value: unknown): value is TAvatarIcon =>
  typeof value === 'string' && AVATAR_ICONS.some((entry) => entry.id === value);
