import { NextResponse } from 'next/server';

import { ALREADY_REGISTERED_PATTERN, HTTP_STATUS_BY_PG_CODE } from '@constants';
import { createClient as createServerClient } from '@/lib/supabase/server';

import { getAdminClient } from './utils';

export const handleWorkspaceInvite = async (request: Request) => {
  const body = await request.json().catch(() => null);
  const workspaceId = body?.workspaceId;
  const email = body?.email;
  const roleId = body?.roleId;

  if (typeof workspaceId !== 'string' || typeof email !== 'string' || typeof roleId !== 'string') {
    return NextResponse.json({ error: { message: 'Invalid request' } }, { status: 400 });
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
  }

  const { data: invitationId, error } = await supabase.rpc('create_workspace_invitation', {
    p_workspace_id: workspaceId,
    p_email: email,
    p_role_id: roleId,
  });

  if (error) {
    return NextResponse.json(
      { error: { message: error.message, code: error.code } },
      { status: HTTP_STATUS_BY_PG_CODE[error.code ?? ''] ?? 500 },
    );
  }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name')
    .eq('id', workspaceId)
    .maybeSingle<{ name: string }>();
  const workspaceName = workspace?.name ?? '';
  const invitedByName =
    ((user.user_metadata?.name as string | undefined) ?? '').trim() || (user.email ?? '').split('@')[0];

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/join`;
  const { error: inviteError } = await getAdminClient().auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: {
      name: email.split('@')[0],
      workspaceName,
      workspaceInitial: workspaceName.trim().charAt(0).toUpperCase(),
      invitedByName,
    },
  });

  if (inviteError && !ALREADY_REGISTERED_PATTERN.test(inviteError.message)) {
    console.error('[workspaceInvite] invite email failed', inviteError.message);

    const { error: revokeError } = await supabase.rpc('revoke_workspace_invitation', {
      p_invitation_id: invitationId,
    });
    if (revokeError) console.error('[workspaceInvite] invitation rollback failed', revokeError.message);

    return NextResponse.json({ error: { message: inviteError.message } }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
};
