import type { TAuthNoticeTone } from '@interfaces';

export const AUTH_NOTICE_TONE_CLASSES: Record<TAuthNoticeTone, string> = {
  alert: 'border-[color:var(--hero-refuted)]/35 bg-[color:var(--hero-refuted)]/10 text-[color:var(--hero-refuted)]',
  notice: 'border-[color:var(--hero-tainted)]/35 bg-[color:var(--hero-tainted)]/10 text-[color:var(--hero-tainted)]',
};

export const AUTH_NOTICE_ROLES: Record<TAuthNoticeTone, 'alert' | 'status'> = {
  alert: 'alert',
  notice: 'status',
};

export const COUNTDOWN_TICK_MS = 1000;
