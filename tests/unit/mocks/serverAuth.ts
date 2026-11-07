import { vi } from 'vitest';

import { PASSWORD_RESET_REQUEST_COOKIE, PASSWORD_RESET_RESEND_WINDOW_MS } from '@constants';

import { RESET_CLOCK } from './authApi';

export const verifyPassword = vi.fn();

export const WRONG_PASSWORD = { error: { code: 'invalid_credentials', status: 400 } };

export const sendPasswordResetEmail = vi.fn();

export const RESET_EMAIL_SENT = { data: {}, error: null };

export const RESET_EMAIL_THROTTLED = { data: null, error: { code: 'over_email_send_rate_limit', status: 429 } };

export const RESET_EMAIL_CRASH = new Error('supabaseUrl is required.');

export const ANSWERED_RESET_COOKIE = `${PASSWORD_RESET_REQUEST_COOKIE}=${encodeURIComponent(`${RESET_CLOCK + PASSWORD_RESET_RESEND_WINDOW_MS}:cookie@user.dev`)}`;
