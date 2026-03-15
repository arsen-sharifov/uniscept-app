import { createClient } from './client';

export const getCurrentUserId = async (): Promise<string | null> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
};
