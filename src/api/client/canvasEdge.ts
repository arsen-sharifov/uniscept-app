import type { ICanvasEdgeRow, THandleId } from '@interfaces';
import { createClient } from '@/lib/supabase/client';

interface ICreateCanvasEdgeInput {
  id: string;
  threadId: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle: THandleId;
  targetHandle: THandleId;
}

export const createCanvasEdge = async (input: ICreateCanvasEdgeInput) => {
  const supabase = createClient();
  return supabase.from('canvas_edges').insert({
    id: input.id,
    thread_id: input.threadId,
    source_node_id: input.sourceNodeId,
    target_node_id: input.targetNodeId,
    source_handle: input.sourceHandle,
    target_handle: input.targetHandle,
  });
};

export const deleteCanvasEdge = async (id: string) => {
  const supabase = createClient();
  return supabase.from('canvas_edges').delete().eq('id', id);
};

export const getCanvasEdges = async (
  threadId: string
): Promise<ICanvasEdgeRow[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from('canvas_edges')
    .select(
      'id, thread_id, source_node_id, target_node_id, source_handle, target_handle, created_at'
    )
    .eq('thread_id', threadId)
    .order('created_at');
  return (data as ICanvasEdgeRow[] | null) ?? [];
};
