import type { IAppError, IHandleErrorOptions, IToastOptions, TToastType } from '@interfaces';
import { TOAST_DEFAULT_DURATION_MS, TOAST_ERROR_DURATION_MS } from '@constants';

import { reportError } from './errorSinks';
import { normalizeError } from './normalizeError';
import { useToastStore } from './stores';

const durationFor = (type: TToastType, override?: number): number =>
  override ?? (type === 'error' ? TOAST_ERROR_DURATION_MS : TOAST_DEFAULT_DURATION_MS);

const show = (type: TToastType, message: string, options?: IToastOptions): string =>
  useToastStore.getState().add({
    type,
    message,
    title: options?.title,
    duration: durationFor(type, options?.duration),
  });

const fail = (error: unknown, options?: IHandleErrorOptions): IAppError => {
  const normalized = normalizeError(error);
  const appError: IAppError = options?.context ? { ...normalized, context: options.context } : normalized;

  reportError(appError);

  if (options?.toast !== false) {
    useToastStore.getState().add({
      errorCategory: appError.category,
      title: options?.title,
      duration: durationFor('error', options?.duration),
    });
  }

  return appError;
};

export const event = {
  success: (message: string, options?: IToastOptions) => show('success', message, options),
  info: (message: string, options?: IToastOptions) => show('info', message, options),
  warning: (message: string, options?: IToastOptions) => show('warning', message, options),
  error: fail,
};
