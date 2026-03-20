import { createClient } from '@/lib/supabase/client';

export const signIn = async (email: string, password: string) => {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string, name: string) => {
  const supabase = createClient();

  return supabase.auth.signUp({
    email,
    password,
    options: { data: { name, plan: 'beta' } },
  });
};

export const signOut = async () => {
  const supabase = createClient();
  return supabase.auth.signOut();
};

export const verifyInviteCode = async (code: string) => {
  const res = await fetch('/auth/verify-invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  return res.ok;
};
