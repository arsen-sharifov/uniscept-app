import type { IPreferences } from '@interfaces';

import { createClient } from '@/lib/supabase';

const COLUMN_BY_KEY: Record<keyof IPreferences, string> = {
  theme: 'theme',
  canvasPattern: 'canvas_pattern',
  language: 'language',
  snapToGrid: 'snap_to_grid',
  defaultZoom: 'default_zoom',
  smartGuides: 'smart_guides',
};

const KEY_BY_COLUMN = Object.fromEntries(Object.entries(COLUMN_BY_KEY).map(([key, column]) => [column, key])) as Record<
  string,
  keyof IPreferences
>;

const SELECT_COLUMNS = Object.values(COLUMN_BY_KEY).join(', ');

const isPreferenceKey = (key: string): key is keyof IPreferences => key in COLUMN_BY_KEY;

export const getPreferences = async (): Promise<IPreferences | null> => {
  const supabase = createClient();
  const { data, error } = await supabase.from('user_preferences').select(SELECT_COLUMNS).maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return Object.fromEntries(
    Object.entries(data).map(([column, value]) => [KEY_BY_COLUMN[column], value]),
  ) as IPreferences;
};

export const upsertPreferences = async (prefs: IPreferences): Promise<void> => {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) return;

  const { error } = await supabase.from('user_preferences').upsert({
    user_id: user.id,
    ...Object.fromEntries(
      Object.entries(prefs)
        .filter(([key]) => isPreferenceKey(key))
        .map(([key, value]) => [COLUMN_BY_KEY[key as keyof IPreferences], value]),
    ),
  });

  if (error) throw error;
};
