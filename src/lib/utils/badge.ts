import type { TBadgeId } from '@interfaces';
import { BADGES } from '@constants';

export const isBadgeId = (value: unknown): value is TBadgeId =>
  typeof value === 'string' && BADGES.some((badge) => badge.id === value);
