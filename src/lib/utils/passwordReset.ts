import type { IPasswordResetCountdown, IPasswordResetRequest, IPendingPasswordReset } from '@interfaces';
import {
  EMAIL_PATTERN,
  PASSWORD_RESET_REQUEST_COOKIE_SEPARATOR,
  PASSWORD_RESET_RESEND_WINDOW_SECONDS,
} from '@constants';

export const toPasswordResetCookie = ({ email, resendAt }: IPasswordResetRequest): string =>
  `${resendAt}${PASSWORD_RESET_REQUEST_COOKIE_SEPARATOR}${email}`;

export const readPasswordResetCookie = (value: string | undefined): IPasswordResetRequest | null => {
  const separatorIndex = value?.indexOf(PASSWORD_RESET_REQUEST_COOKIE_SEPARATOR) ?? -1;

  if (!value || separatorIndex < 1) return null;

  const resendAt = Number(value.slice(0, separatorIndex));
  const email = value.slice(separatorIndex + 1);

  return Number.isFinite(resendAt) && EMAIL_PATTERN.test(email) ? { email, resendAt } : null;
};

export const toSecondsLeft = (resendAt: number, now = Date.now()): number =>
  Math.min(Math.max(Math.ceil((resendAt - now) / 1000), 0), PASSWORD_RESET_RESEND_WINDOW_SECONDS);

export const toPendingPasswordReset = (
  request: IPasswordResetRequest | null,
  now = Date.now(),
): IPendingPasswordReset | null => {
  const secondsLeft = request ? toSecondsLeft(request.resendAt, now) : 0;

  return request && secondsLeft > 0 ? { email: request.email, secondsLeft } : null;
};

export const restorePasswordReset = (
  remembered: IPasswordResetRequest | null,
  pending: IPendingPasswordReset | null,
  draftEmail: string,
  now = Date.now(),
): IPasswordResetCountdown | null => {
  const rememberedPending = remembered && toPendingPasswordReset(remembered, now);
  const restored = remembered ? rememberedPending : pending;
  const isAnotherEmail = Boolean(draftEmail) && restored?.email.toLowerCase() !== draftEmail.toLowerCase();

  if (!restored || isAnotherEmail) return null;

  return { ...restored, resendAt: remembered?.resendAt ?? now + restored.secondsLeft * 1000 };
};
