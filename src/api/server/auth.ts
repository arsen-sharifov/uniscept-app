import { NextResponse } from 'next/server';

export const handleVerifyInvite = async (request: Request) => {
  const body = await request.json().catch(() => null);
  const code = body?.code;

  if (!code || code !== process.env.INVITE_CODE) {
    return NextResponse.json({ valid: false }, { status: 403 });
  }

  return NextResponse.json({ valid: true });
};
