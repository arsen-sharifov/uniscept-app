import type { MODAL_SCROLL_LOCK_KEY } from '@constants';

export type TWindowWithStack = Window & Partial<Record<typeof MODAL_SCROLL_LOCK_KEY, number>>;
