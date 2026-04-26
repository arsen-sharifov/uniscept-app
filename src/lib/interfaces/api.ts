export enum ECanvasNodeType {
  Canvas = 'canvas-node',
  Reference = 'reference-node',
}

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

export interface ICanvasNodeWithThreadRow {
  id: string;
  label: string;
  thread_id: string;
  threads: {
    id: string;
    name: string;
    workspace_id: string;
    workspaces: { name: string } | null;
  } | null;
}

export interface ICanvasNodeRow {
  id: string;
  thread_id: string;
  type: ECanvasNodeType;
  position_x: number;
  position_y: number;
  label: string;
  status: 'valid' | 'invalid' | null;
  source_node_id: string | null;
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

export interface ICanvasCommentRow {
  id: string;
  thread_id: string;
  author_id: string;
  text: string;
  created_at: string;
}

export interface IReferenceTargetMeta {
  nodeLabel: string;
  threadId: string;
  threadName: string;
  workspaceId: string;
  workspaceName: string;
}

export interface ICreateCanvasNodeInput {
  id: string;
  threadId: string;
  type: ECanvasNodeType;
  x: number;
  y: number;
  label: string;
  sourceNodeId: string | null;
}

export interface INodePositionUpdate {
  id: string;
  x: number;
  y: number;
}

export interface ICreateCanvasEdgeInput {
  id: string;
  threadId: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle: 'top' | 'right' | 'bottom' | 'left';
  targetHandle: 'top' | 'right' | 'bottom' | 'left';
}

export interface ICreateNodeCommentInput {
  id: string;
  nodeId: string;
  text: string;
}

export interface ICreateCanvasCommentInput {
  id: string;
  threadId: string;
  text: string;
}
