import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

let adminClient: ReturnType<typeof createClient> | null = null;

const getAdminClient = () => {
  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return adminClient;
};

export const handleVerifyInvite = async (request: Request) => {
  const body = await request.json().catch(() => null);
  const code = body?.code;

  if (!code || code !== process.env.INVITE_CODE) {
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
