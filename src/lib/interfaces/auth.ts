export interface IRateLimitBucket {
  count: number;
  resetAt: number;
}

export interface IRateLimitOptions {
  maxAttempts: number;
  windowMs: number;
}

export interface IContentSecurityPolicyOptions {
  nonce: string;
  supabaseUrl: string;
  isDevelopment: boolean;
}

export type TPasswordResetRequestResult = 'sent' | 'throttled';

export interface IPasswordResetRequest {
  email: string;
  resendAt: number;
}

export interface IPendingPasswordReset {
  email: string;
  secondsLeft: number;
}

export interface IPasswordResetCountdown extends IPasswordResetRequest {
  secondsLeft: number;
}
