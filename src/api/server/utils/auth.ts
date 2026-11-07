import { createClient } from '@supabase/supabase-js';

import { event } from '@/lib/events';

const createStatelessAuth = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  }).auth;

export const verifyPassword = async (email: string, password: string) => {
  const auth = createStatelessAuth();
  const { error } = await auth.signInWithPassword({ email, password });

  if (error) return { error };

  const { error: signOutError } = await auth.signOut({ scope: 'local' });

  if (signOutError) event.error(signOutError, { toast: false, context: 'auth.endPasswordCheckSession' });

  return { error: null };
};

export const sendPasswordResetEmail = (email: string) =>
  createStatelessAuth().resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });
