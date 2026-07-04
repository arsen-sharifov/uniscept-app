import type { TErrorCategory } from '@interfaces';

export const FETCH_FAILURE_PATTERN = /failed to fetch|networkerror|load failed/i;

export const CATEGORY_BY_HTTP_STATUS: Record<number, TErrorCategory> = {
  401: 'auth',
  403: 'permission',
  404: 'notFound',
  408: 'network',
  429: 'rateLimit',
};

export const CATEGORY_BY_CODE: Record<string, TErrorCategory> = {
  '23505': 'validation',
  '23503': 'validation',
  '42501': 'permission',
  PGRST301: 'auth',
  invalid_credentials: 'invalidCredentials',
  email_not_confirmed: 'emailNotConfirmed',
  user_already_exists: 'emailTaken',
  email_exists: 'emailTaken',
  email_address_invalid: 'invalidEmail',
  weak_password: 'weakPassword',
  same_password: 'samePassword',
  validation_failed: 'validation',
  session_not_found: 'auth',
  session_expired: 'auth',
  refresh_token_not_found: 'auth',
  request_timeout: 'network',
  over_request_rate_limit: 'rateLimit',
  over_email_send_rate_limit: 'rateLimit',
};
