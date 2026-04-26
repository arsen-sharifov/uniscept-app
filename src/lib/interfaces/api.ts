export interface IWorkspaceRow {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  position: number;
}

export interface IFolderRow {
  id: string;
  workspace_id: string;
  parent_folder_id: string | null;
  name: string;
  position: number;
}

export interface IThreadRow {
  id: string;
  workspace_id: string;
  folder_id: string | null;
  name: string;
  position: number;
}

export interface ICanvasNodeRow {
  id: string;
  thread_id: string;
  type: 'canvas-node' | 'reference-node';
  position_x: number;
  position_y: number;
  label: string;
  status: 'valid' | 'invalid' | null;
  source_thread_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ICanvasEdgeRow {
  id: string;
  thread_id: string;
  source_node_id: string;
  target_node_id: string;
  source_handle: 'top' | 'right' | 'bottom' | 'left';
  target_handle: 'top' | 'right' | 'bottom' | 'left';
  created_at: string;
}

export interface INodeCommentRow {
  id: string;
  node_id: string;
  author_id: string;
  text: string;
  created_at: string;
}
