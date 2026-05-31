import type { IUserProfileUpdate } from '@interfaces';

import { createClient } from '@/lib/supabase';

import { signOut } from './auth';

export const getUser = async () => {
  const supabase = createClient();

  return supabase.auth.getUser();
};

export const updateUserMetadata = async (data: IUserProfileUpdate) => {
  const supabase = createClient();

  return supabase.auth.updateUser({ data });
};

export const updateEmail = async (email: string) => {
  const supabase = createClient();

  return supabase.auth.updateUser({ email });
};

export const verifyPassword = async (email: string, password: string) => {
  const supabase = createClient();

  return supabase.auth.signInWithPassword({ email, password });
};

export const updatePassword = async (password: string) => {
  const supabase = createClient();

  return supabase.auth.updateUser({ password });
};

export const deleteAccount = async () => {
  const res = await fetch('/auth/delete-account', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to delete account');
  await signOut();
};
