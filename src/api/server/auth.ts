import { createHash, timingSafeEqual } from 'node:crypto';

import type { AuthError, User } from '@supabase/supabase-js';
import { after, NextResponse } from 'next/server';

import {
  INVITE_RATE_LIMIT_MAX_ATTEMPTS,
  INVITE_RATE_LIMIT_WINDOW_MS,
  PASSWORD_CHECK_RATE_LIMIT_MAX_ATTEMPTS,
  PASSWORD_CHECK_RATE_LIMIT_WINDOW_MS,
  PASSWORD_RESET_EMAIL_RATE_LIMIT_MAX_ATTEMPTS,
  PASSWORD_RESET_EMAIL_RATE_LIMIT_WINDOW_MS,
  PASSWORD_RESET_IP_RATE_LIMIT_MAX_ATTEMPTS,
  PASSWORD_RESET_IP_RATE_LIMIT_WINDOW_MS,
  PASSWORD_RESET_REQUEST_COOKIE,
  PASSWORD_RESET_REQUEST_COOKIE_PATH,
  PASSWORD_RESET_RESEND_MAX_ATTEMPTS,
  PASSWORD_RESET_RESEND_WINDOW_MS,
  PASSWORD_RESET_RESEND_WINDOW_SECONDS,
} from '@constants';
import { event } from '@/lib/events';
import { toPasswordResetCookie } from '@/lib/utils';

import {
  authenticateRequest,
  createRateLimiter,
  getAdminClient,
  getClientIp,
  isSameOriginRequest,
  normalizeEmail,
  sendPasswordResetEmail,
  verifyPassword,
} from './utils';

const allowInviteAttempt = createRateLimiter({
  maxAttempts: INVITE_RATE_LIMIT_MAX_ATTEMPTS,
  windowMs: INVITE_RATE_LIMIT_WINDOW_MS,
});

const allowPasswordCheck = createRateLimiter({
  maxAttempts: PASSWORD_CHECK_RATE_LIMIT_MAX_ATTEMPTS,
  windowMs: PASSWORD_CHECK_RATE_LIMIT_WINDOW_MS,
});

const allowPasswordResetFromIp = createRateLimiter({
  maxAttempts: PASSWORD_RESET_IP_RATE_LIMIT_MAX_ATTEMPTS,
  windowMs: PASSWORD_RESET_IP_RATE_LIMIT_WINDOW_MS,
});

const allowPasswordResetResend = createRateLimiter({
  maxAttempts: PASSWORD_RESET_RESEND_MAX_ATTEMPTS,
  windowMs: PASSWORD_RESET_RESEND_WINDOW_MS,
});

const allowPasswordResetForEmail = createRateLimiter({
  maxAttempts: PASSWORD_RESET_EMAIL_RATE_LIMIT_MAX_ATTEMPTS,
  windowMs: PASSWORD_RESET_EMAIL_RATE_LIMIT_WINDOW_MS,
});

const rememberPasswordResetRequest = (response: NextResponse, email: string): NextResponse => {
  response.cookies.set(
    PASSWORD_RESET_REQUEST_COOKIE,
    toPasswordResetCookie({ email, resendAt: Date.now() + PASSWORD_RESET_RESEND_WINDOW_MS }),
    {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: PASSWORD_RESET_REQUEST_COOKIE_PATH,
      maxAge: PASSWORD_RESET_RESEND_WINDOW_SECONDS,
    },
  );

  return response;
};

const digest = (value: string) => createHash('sha256').update(value, 'utf8').digest();

const toFailureStatus = (error: AuthError) => (error.status && error.status >= 400 ? error.status : 500);

const checkCurrentPassword = async (user: User, password: unknown): Promise<NextResponse | null> => {
  if (typeof password !== 'string' || !password || !user.email) {
    return NextResponse.json({ error: { message: 'Invalid request' } }, { status: 400 });
  }

  if (!allowPasswordCheck(user.id)) {
    return NextResponse.json({ error: { message: 'Too many attempts, try again later' } }, { status: 429 });
  }

  const { error } = await verifyPassword(user.email, password);

  if (!error) return null;

  if (error.code === 'invalid_credentials') {
    return NextResponse.json({ error: { message: 'Invalid credentials', code: error.code } }, { status: 400 });
  }

  event.error(error, { toast: false, context: 'auth.verifyPassword' });

  return NextResponse.json(
    { error: { message: 'Password check failed', code: error.code } },
    { status: toFailureStatus(error) },
  );
};

export const handleVerifyInvite = async (request: Request) => {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ valid: false }, { status: 403 });
  }

  if (!allowInviteAttempt(getClientIp(request))) {
    return NextResponse.json({ valid: false }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const code = body?.code;
  const email = normalizeEmail(body?.email);
  const expected = process.env.INVITE_CODE;

  if (!email) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  if (typeof code !== 'string' || !expected || !timingSafeEqual(digest(code), digest(expected))) {
    return NextResponse.json({ valid: false }, { status: 403 });
  }

  const { error } = await getAdminClient().rpc('grant_signup_allowance', { p_email: email });

  if (error) {
    event.error(error, { toast: false, context: 'auth.grantSignupAllowance' });

    return NextResponse.json({ valid: false }, { status: 500 });
  }

  return NextResponse.json({ valid: true });
};

export const handleRequestPasswordReset = async (request: Request) => {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: { message: 'Forbidden' } }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const email = normalizeEmail(body?.email);

  if (!email) {
    return NextResponse.json({ error: { message: 'Invalid request' } }, { status: 400 });
  }

  if (
    !allowPasswordResetFromIp(getClientIp(request)) ||
    !allowPasswordResetResend(email) ||
    !allowPasswordResetForEmail(email)
  ) {
    return rememberPasswordResetRequest(
      NextResponse.json({ error: { message: 'Too many attempts, try again later' } }, { status: 429 }),
      email,
    );
  }

  after(async () => {
    const result = await sendPasswordResetEmail(email).catch((error: unknown) => ({ error }));

    if (result.error) event.error(result.error, { toast: false, context: 'auth.sendPasswordResetEmail' });
  });

  return rememberPasswordResetRequest(NextResponse.json({ success: true }), email);
};

export const handleChangePassword = async (request: Request) => {
  const { rejection, supabase, user } = await authenticateRequest(request);

  if (rejection) return rejection;

  const body = await request.json().catch(() => null);
  const currentPassword = body?.currentPassword;
  const newPassword = body?.newPassword;

  if (typeof newPassword !== 'string' || !newPassword) {
    return NextResponse.json({ error: { message: 'Invalid request' } }, { status: 400 });
  }

  const passwordRejection = await checkCurrentPassword(user, currentPassword);

  if (passwordRejection) return passwordRejection;

  const { error } = await supabase.auth.updateUser({ password: newPassword, current_password: currentPassword });

  if (error) {
    event.error(error, { toast: false, context: 'auth.changePassword' });

    return NextResponse.json(
      { error: { message: 'Password update failed', code: error.code } },
      { status: toFailureStatus(error) },
    );
  }

  return NextResponse.json({ success: true });
};

export const handleDeleteAccount = async (request: Request) => {
  const { rejection, supabase, user } = await authenticateRequest(request);

  if (rejection) return rejection;

  const body = await request.json().catch(() => null);
  const passwordRejection = await checkCurrentPassword(user, body?.password);

  if (passwordRejection) return passwordRejection;

  const { data: sharedWorkspaces, error: checkError } = await supabase.rpc('get_my_owned_shared_workspaces');

  if (checkError) {
    event.error(checkError, { toast: false, context: 'auth.checkSharedWorkspaces' });

    return NextResponse.json({ error: { message: 'Account deletion failed' } }, { status: 500 });
  }

  if (sharedWorkspaces?.length) {
    return NextResponse.json(
      { error: { message: 'Account owns shared workspaces', code: 'owns_shared_workspaces' } },
      { status: 409 },
    );
  }

  const { error } = await getAdminClient().auth.admin.deleteUser(user.id);

  if (error) {
    event.error(error, { toast: false, context: 'auth.deleteAccount' });

    return NextResponse.json({ error: { message: 'Account deletion failed' } }, { status: 500 });
  }

  return NextResponse.json({ success: true });
};
