import type { User } from '@supabase/supabase-js';
import { vi } from 'vitest';

export const completeInvitedAccount = vi.fn();

export const getCurrentUserId = vi.fn();

export const getSession = vi.fn();

export const signIn = vi.fn();

export const signUp = vi.fn();

export const verifyInvitation = vi.fn();

export const verifyInviteCode = vi.fn();

export const sessionOf = (user: Partial<User> | null) => ({ data: { session: user && { user } }, error: null });

export const VERIFIED_INVITATION = { data: { user: { email: 'invitee@example.com' }, session: {} }, error: null };

export const UNFINISHED_INVITEE = {
  email: 'invitee@example.com',
  invited_at: '2026-10-01T10:00:00Z',
  user_metadata: {},
};
