import type { ICanvasNodeRow, ICreateCanvasNodeInput, INodePositionUpdate, TNodeStatus } from '@interfaces';
import { createClient } from '@/lib/supabase';

export const createCanvasNode = async (input: ICreateCanvasNodeInput): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase.from('canvas_nodes').insert({
    id: input.id,
    thread_id: input.threadId,
    type: input.type,
    position_x: input.x,
    position_y: input.y,
    label: input.label,
    source_node_id: input.sourceNodeId,
  });

  if (error) throw error;
};

export const updateCanvasNodePositions = async (updates: INodePositionUpdate[]): Promise<void> => {
  if (updates.length === 0) return;

  const supabase = createClient();

  const payload = updates.map((update) => ({
    id: update.id,
    position_x: Number.isFinite(update.x) ? update.x : 0,
    position_y: Number.isFinite(update.y) ? update.y : 0,
  }));

  const { data, error } = await supabase.rpc('update_canvas_node_positions', {
    updates: payload,
  });

  if (error) throw error;

  if (typeof data === 'number' && data !== updates.length) {
    throw new Error(`update_canvas_node_positions: expected ${updates.length} rows, updated ${data}`);
  }
};

export const updateCanvasNodeLabel = async (id: string, label: string): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase.from('canvas_nodes').update({ label }).eq('id', id);

  if (error) throw error;
};

export const updateCanvasNodeStatus = async (id: string, status: TNodeStatus): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase.from('canvas_nodes').update({ status }).eq('id', id);

  if (error) throw error;
};

export const deleteCanvasNode = async (id: string): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase.from('canvas_nodes').delete().eq('id', id);

  if (error) throw error;
};

export const getCanvasNodes = async (threadId: string): Promise<ICanvasNodeRow[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('canvas_nodes')
    .select('id, thread_id, type, position_x, position_y, label, status, source_node_id, created_at, updated_at')
    .eq('thread_id', threadId)
    .order('created_at')
    .returns<ICanvasNodeRow[]>();

  if (error) throw error;

  return data ?? [];
};
