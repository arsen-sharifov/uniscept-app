import { createClient } from '@/lib/supabase';

export const getCurrentUserId = async (): Promise<string> => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;

  const userId = data.user?.id;
  if (!userId) throw new Error('Authenticated user required');

  return userId;
};
