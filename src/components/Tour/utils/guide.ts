import type { TGuideStatus } from '@interfaces';

export const resolveGuideStatus = (isDone: boolean, locked: boolean): TGuideStatus => {
  if (isDone) return 'done';

  return locked ? 'locked' : 'ready';
};
