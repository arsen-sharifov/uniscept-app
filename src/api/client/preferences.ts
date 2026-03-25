import type { IPreferences } from '@interfaces';
import { createClient } from '@/lib/supabase/client';

const toSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

const toCamelCase = (str: string) =>
  str.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

export const getPreferences = async (): Promise<IPreferences | null> => {
  const supabase = createClient();
  const { data } = await supabase
    .from('user_preferences')
    .select(
      'theme, snap_to_grid, show_grid, show_minimap, default_zoom, email_mentions, email_comments, email_invites, email_digest'
    )
    .maybeSingle();
  if (!data) return null;

  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [toCamelCase(k), v])
  ) as IPreferences;
};

export const upsertPreferences = async (prefs: IPreferences) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  return supabase.from('user_preferences').upsert({
    user_id: user.id,
    ...Object.fromEntries(
      Object.entries(prefs).map(([k, v]) => [toSnakeCase(k), v])
    ),
  });
};
