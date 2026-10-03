import { createClient } from '@/lib/supabase';

export const getNextPosition = async (
  table: string,
  workspaceId: string,
  parentColumn: string,
  parentId?: string,
): Promise<number> => {
  const supabase = createClient();
  const query = supabase.from(table).select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId);

  const { count, error } = await (parentId ? query.eq(parentColumn, parentId) : query.is(parentColumn, null));

  if (error) throw error;

  return count ?? 0;
};
