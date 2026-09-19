import type { User } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase';

export const getCurrentUser = async (): Promise<User> => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;
  if (!data.user) throw new Error('Authenticated user required');

  return data.user;
};

export const getCurrentUserId = async (): Promise<string> => (await getCurrentUser()).id;
