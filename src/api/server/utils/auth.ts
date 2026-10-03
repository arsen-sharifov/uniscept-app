import { createClient } from '@supabase/supabase-js';

export const verifyPassword = (email: string, password: string) =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  }).auth.signInWithPassword({ email, password });
