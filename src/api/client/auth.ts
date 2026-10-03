import { createClient } from '@/lib/supabase';

import { toResponseError } from './utils';

export const signIn = (email: string, password: string) => {
  const supabase = createClient();

  return supabase.auth.signInWithPassword({ email, password });
};

export const signUp = (email: string, password: string, name: string) => {
  const supabase = createClient();

  return supabase.auth.signUp({
    email,
    password,
    options: { data: { name, plan: 'beta' } },
  });
};

export const getSession = () => {
  const supabase = createClient();

  return supabase.auth.getSession();
};

export const verifyInvitation = (tokenHash: string) => {
  const supabase = createClient();

  return supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'invite' });
};

export const completeInvitedAccount = (name: string, password: string) => {
  const supabase = createClient();

  return supabase.auth.updateUser({ password, data: { name, plan: 'beta' } });
};

export const signOut = async (): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
};

export const verifyInviteCode = async (code: string, email: string) => {
  const res = await fetch('/auth/verify-invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, email }),
  });

  if (res.ok) return true;
  if (res.status === 403) return false;

  throw await toResponseError(res, 'Invite code check failed');
};
