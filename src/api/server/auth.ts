import { timingSafeEqual } from 'node:crypto';

import { NextResponse } from 'next/server';

import { INVITE_RATE_LIMIT_MAX_ATTEMPTS, INVITE_RATE_LIMIT_WINDOW_MS } from '@constants';
import { createClient as createServerClient } from '@/lib/supabase/server';

import { getAdminClient } from './utils';

const inviteAttempts = new Map<string, { count: number; resetAt: number }>();

const safeEqualStrings = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;

  return timingSafeEqual(bufA, bufB);
};

const getClientIp = (request: Request): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();

  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();

  return 'unknown';
};

const checkInviteRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const record = inviteAttempts.get(ip);

  if (!record || record.resetAt <= now) {
    inviteAttempts.set(ip, { count: 1, resetAt: now + INVITE_RATE_LIMIT_WINDOW_MS });

    return true;
  }

  if (record.count >= INVITE_RATE_LIMIT_MAX_ATTEMPTS) return false;

  record.count += 1;

  return true;
};

export const handleVerifyInvite = async (request: Request) => {
  if (!checkInviteRateLimit(getClientIp(request))) {
    return NextResponse.json({ valid: false }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const code = body?.code;
  const expected = process.env.INVITE_CODE;

  if (typeof code !== 'string' || !expected || !safeEqualStrings(code, expected)) {
    return NextResponse.json({ valid: false }, { status: 403 });
  }

  return NextResponse.json({ valid: true });
};

export const handleDeleteAccount = async () => {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await getAdminClient().auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
};
