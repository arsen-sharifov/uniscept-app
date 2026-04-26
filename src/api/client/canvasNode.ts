import type { ICanvasNodeRow, TNodeStatus } from '@interfaces';
import { createClient } from '@/lib/supabase/client';

interface ICreateCanvasNodeInput {
  id: string;
  threadId: string;
  type: 'canvas-node' | 'reference-node';
  x: number;
  y: number;
  label: string;
  sourceThreadId?: string | null;
}

export const createCanvasNode = async (input: ICreateCanvasNodeInput) => {
  const supabase = createClient();
  return supabase.from('canvas_nodes').insert({
    id: input.id,
    thread_id: input.threadId,
    type: input.type,
    position_x: input.x,
    position_y: input.y,
    label: input.label,
    source_thread_id: input.sourceThreadId ?? null,
  });
};

export const updateCanvasNodePosition = async (
  id: string,
  x: number,
  y: number
) => {
  const supabase = createClient();
  return supabase
    .from('canvas_nodes')
    .update({ position_x: x, position_y: y })
    .eq('id', id);
};

interface IPositionUpdate {
  id: string;
  x: number;
  y: number;
}

export const updateCanvasNodePositionsBatch = async (
  updates: IPositionUpdate[]
) => {
  if (updates.length === 0) return;
  const supabase = createClient();
  await Promise.all(
    updates.map((update) =>
      supabase
        .from('canvas_nodes')
        .update({ position_x: update.x, position_y: update.y })
        .eq('id', update.id)
    )
  );
};

export const updateCanvasNodeLabel = async (id: string, label: string) => {
  const supabase = createClient();
  return supabase.from('canvas_nodes').update({ label }).eq('id', id);
};

export const updateCanvasNodeStatus = async (
  id: string,
  status: TNodeStatus
) => {
  const supabase = createClient();
  return supabase.from('canvas_nodes').update({ status }).eq('id', id);
};

export const deleteCanvasNode = async (id: string) => {
  const supabase = createClient();
  return supabase.from('canvas_nodes').delete().eq('id', id);
};

export const getCanvasNodes = async (
  threadId: string
): Promise<ICanvasNodeRow[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from('canvas_nodes')
    .select(
      'id, thread_id, type, position_x, position_y, label, status, source_thread_id, created_at, updated_at'
    )
    .eq('thread_id', threadId)
    .order('created_at');
  return (data as ICanvasNodeRow[] | null) ?? [];
};
