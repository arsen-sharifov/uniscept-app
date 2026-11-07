import type { User } from '@supabase/supabase-js';
import { vi } from 'vitest';

import { NAMED_ACCOUNT } from './userApi';

export const completeInvitedAccount = vi.fn();

export const completePasswordReset = vi.fn();

export const getCurrentUserId = vi.fn();

export const getSession = vi.fn();

export const requestPasswordReset = vi.fn();

export const signIn = vi.fn();

export const signUp = vi.fn();

export const verifyInvitation = vi.fn();

export const verifyInviteCode = vi.fn();

export const verifyPasswordReset = vi.fn();

export const sessionOf = (user: Partial<User> | null) => ({ data: { session: user && { user } }, error: null });

export const VERIFIED_INVITATION = { data: { user: { email: 'invitee@example.com' }, session: {} }, error: null };

export const UNFINISHED_INVITEE = {
  email: 'invitee@example.com',
  invited_at: '2026-10-01T10:00:00Z',
  user_metadata: {},
};

export const FINISHED_INVITEE = { ...UNFINISHED_INVITEE, user_metadata: { name: 'Grace', plan: 'beta' } };

export const VERIFIED_RESET = { data: { user: NAMED_ACCOUNT, session: {} }, error: null };

export const VERIFIED_INVITEE_RESET = { data: { user: UNFINISHED_INVITEE, session: {} }, error: null };

export const EXPIRED_RESET = {
  data: { user: null, session: null },
  error: { code: 'otp_expired', status: 403, message: 'Email link is invalid or has expired' },
};

export const UNREACHABLE_RESET = {
  data: { user: null, session: null },
  error: { status: 0, message: 'Failed to fetch' },
};

export const PASSWORD_SAVED = { data: { user: NAMED_ACCOUNT }, error: null };

export const SAME_PASSWORD_REFUSED = {
  data: { user: null },
  error: { code: 'same_password', status: 422, message: 'New password should be different from the old password.' },
};

export const RESET_REQUEST_FAILED = Object.assign(new Error('Password reset request failed'), { status: 500 });

export const ELAPSED_COOLDOWN_SECONDS = 20;

export const RESET_CLOCK = Date.parse('2026-11-07T12:00:00Z');

export const REMEMBERED_RESET_REQUEST = { email: 'ada@example.com', resendAt: RESET_CLOCK + 30_000 };

export const EXPIRED_RESET_REQUEST = { email: 'ada@example.com', resendAt: RESET_CLOCK - 1 };

export const PENDING_RESET = { email: 'ada@example.com', secondsLeft: 30 };

export const RESET_REQUEST_COOKIE_VALUE = `${RESET_CLOCK + 30_000}:ada@example.com`;

export const FORGED_RESET_REQUEST = { email: 'ada@example.com', resendAt: RESET_CLOCK + 3_600_000 };

export const SHOUTED_RESET_REQUEST = { email: 'Ada@Example.com', resendAt: RESET_CLOCK + 30_000 };

export const STALE_PENDING_RESET = { email: 'ada@example.com', secondsLeft: 55 };
