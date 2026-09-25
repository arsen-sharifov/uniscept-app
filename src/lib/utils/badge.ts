import type { TBadgeId } from '@interfaces';
import { BADGES, DEFAULT_BADGES } from '@constants';

export const isBadgeId = (value: unknown): value is TBadgeId =>
  typeof value === 'string' && BADGES.some((badge) => badge.id === value);

export const resolveEarnedBadges = (stored: unknown): readonly TBadgeId[] => {
  const valid = Array.isArray(stored) ? stored.filter(isBadgeId) : [];

  return valid.length > 0 ? valid : DEFAULT_BADGES;
};
