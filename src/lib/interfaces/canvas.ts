import type { Edge, Node } from '@xyflow/react';

export enum ECanvasNodeType {
  Canvas = 'canvas-node',
  Reference = 'reference-node',
}

export type TNodeStatus = 'valid' | 'invalid' | null;

export type THandleId = 'top' | 'right' | 'bottom' | 'left';

export interface IComment {
  id: string;
  text: string;
  authorId: string;
}

export interface INodeReference {
  id: string;
  label: string;
  threadId: string;
  threadName: string;
  workspaceId: string;
  workspaceName: string;
}

export interface IReferenceTargetMeta {
  nodeLabel: string;
  threadId: string;
  threadName: string;
  workspaceId: string;
  workspaceName: string;
}

export interface ICanvasNodeData {
  label: string;
  status: TNodeStatus;
  comments: IComment[];
  isNew?: boolean;
  [key: string]: unknown;
}

export type TCanvasNode = Node<ICanvasNodeData>;

export interface IReferenceNodeData {
  label: string;
  sourceNodeId: string;
  sourceNodeLabel: string;
  sourceThreadId: string;
  sourceThreadName: string;
  sourceWorkspaceId: string;
  sourceWorkspaceName: string;
  [key: string]: unknown;
}

export type TReferenceNode = Node<IReferenceNodeData>;

export interface IHandlePair {
  sourceHandle: THandleId;
  targetHandle: THandleId;
}

export interface IHandlePairWithDistance extends IHandlePair {
  distance: number;
}

export type TCanvasContextMenu =
  | { type: 'pane'; x: number; y: number; flowX: number; flowY: number }
  | { type: 'node'; x: number; y: number; nodeId: string }
  | { type: 'edge'; x: number; y: number; edgeId: string };

export interface ICanvasSnapshot {
  nodes: Array<TCanvasNode | TReferenceNode>;
  edges: Edge[];
  canvasComments: IComment[];
}

export type TSaveStatus = 'idle' | 'saving' | 'retrying' | 'saved' | 'error' | 'offline';

export interface ISaveState {
  status: TSaveStatus;
  lastSavedAt: number | null;
  retryAttempt: number;
  pendingCount: number;
  failedCount: number;
}

export type TEdgeTone = 'default' | 'valid' | 'invalid' | 'tainted';

export interface ICanvasEdgeData extends Record<string, unknown> {
  tone?: TEdgeTone;
  bidirectional?: boolean;
}

export type TCanvasEdge = Edge<ICanvasEdgeData>;

export type TEffectiveStatus = TNodeStatus | 'tainted' | 'tainted-valid';

export interface IEdgePaletteEntry {
  stroke: string;
  marker: string;
}

export interface IAlignmentGuide {
  direction: 'vertical' | 'horizontal';
  position: number;
  start: number;
  end: number;
}

export type TMenuItemAccent = 'emerald' | 'red' | 'cyan' | 'neutral';

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
  sourceHandle: THandleId;
  targetHandle: THandleId;
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

export interface IIdScoped {
  id: string;
}

export interface IThreadScoped extends IIdScoped {
  threadId: string;
}

export interface IPositioned extends IThreadScoped {
  x: number;
  y: number;
}

export interface ICreateCanvasNodeOperation extends IPositioned {
  type: 'createCanvasNode';
  label: string;
}

export interface ICreateReferenceNodeOperation extends IPositioned {
  type: 'createReferenceNode';
  data: IReferenceNodeData;
}

export interface IDeleteNodeOperation extends IIdScoped {
  type: 'deleteNode';
}

export interface IUpdateNodePositionOperation extends IIdScoped {
  type: 'updateNodePosition';
  x: number;
  y: number;
}

export interface IUpdateNodeLabelOperation extends IIdScoped {
  type: 'updateNodeLabel';
  label: string;
}

export interface IUpdateNodeStatusOperation extends IIdScoped {
  type: 'updateNodeStatus';
  status: TNodeStatus;
}

export interface ICreateEdgeOperation extends IThreadScoped {
  type: 'createEdge';
  source: string;
  target: string;
  sourceHandle: THandleId;
  targetHandle: THandleId;
}

export interface IDeleteEdgeOperation extends IIdScoped {
  type: 'deleteEdge';
}

export interface ICreateNodeCommentOperation extends IIdScoped {
  type: 'createComment';
  nodeId: string;
  text: string;
}

export interface IDeleteNodeCommentOperation extends IIdScoped {
  type: 'deleteComment';
}

export interface ICreateCanvasCommentOperation extends IThreadScoped {
  type: 'createCanvasComment';
  text: string;
}

export interface IDeleteCanvasCommentOperation extends IIdScoped {
  type: 'deleteCanvasComment';
}

export type TNodeOperation =
  | ICreateCanvasNodeOperation
  | ICreateReferenceNodeOperation
  | IDeleteNodeOperation
  | IUpdateNodePositionOperation
  | IUpdateNodeLabelOperation
  | IUpdateNodeStatusOperation;

export type TEdgeOperation = ICreateEdgeOperation | IDeleteEdgeOperation;

export type TCommentOperation =
  | ICreateNodeCommentOperation
  | IDeleteNodeCommentOperation
  | ICreateCanvasCommentOperation
  | IDeleteCanvasCommentOperation;

export type TCanvasOperation = TNodeOperation | TEdgeOperation | TCommentOperation;

export interface ICanvasNodeRow {
  id: string;
  thread_id: string;
  type: ECanvasNodeType;
  position_x: number;
  position_y: number;
  label: string;
  status: TNodeStatus;
  source_node_id: string | null;
  created_at: string;
  updated_at: string;
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

export interface ICanvasEdgeRow {
  id: string;
  thread_id: string;
  source_node_id: string;
  target_node_id: string;
  source_handle: THandleId;
  target_handle: THandleId;
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
