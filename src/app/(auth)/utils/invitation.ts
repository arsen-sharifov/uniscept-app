import type { User } from '@supabase/supabase-js';

export const isUnfinishedInvitee = (user: Pick<User, 'invited_at' | 'user_metadata'>): boolean =>
  Boolean(user.invited_at) && !user.user_metadata.plan;
