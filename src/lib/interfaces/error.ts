import type { IToastOptions } from '@interfaces';

export type TErrorCategory =
  | 'network'
  | 'permission'
  | 'notFound'
  | 'rateLimit'
  | 'validation'
  | 'auth'
  | 'invalidCredentials'
  | 'invalidEmail'
  | 'emailNotConfirmed'
  | 'emailTaken'
  | 'weakPassword'
  | 'samePassword'
  | 'unknown';

export interface IAppError {
  category: TErrorCategory;
  message: string;
  cause?: unknown;
  context?: string;
}

export type TErrorSink = (error: IAppError) => void;

export interface IHandleErrorOptions extends IToastOptions {
  toast?: boolean;
  context?: string;
}

export interface IRouteError {
  error: Error & { digest?: string };
  reset: () => void;
}
