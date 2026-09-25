import type { IUserMetadata, IUserProfileUpdate, TBadgeId } from '@interfaces';

import { createClient } from '@/lib/supabase';
import { resolveEarnedBadges } from '@/lib/utils';

import { signOut } from './auth';
import { getCurrentUser } from './utils';

export const getUser = async () => {
  const supabase = createClient();

  return supabase.auth.getUser();
};

export const updateUserMetadata = async (data: IUserProfileUpdate) => {
  const supabase = createClient();

  return supabase.auth.updateUser({ data });
};

export const addUserBadge = async (badge: TBadgeId): Promise<void> => {
  const supabase = createClient();
  const user = await getCurrentUser();
  const earned = resolveEarnedBadges((user.user_metadata as IUserMetadata | undefined)?.badges);

  if (earned.includes(badge)) return;

  const { error } = await supabase.auth.updateUser({ data: { badges: [...earned, badge] } });

  if (error) throw error;
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
