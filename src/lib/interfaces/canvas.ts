import type { Edge, Node } from '@xyflow/react';
import type { ICanvasCommentRow, ICanvasEdgeRow, ICanvasNodeRow, INodeCommentRow, IReferenceTargetMeta } from './api';

export type TNodeStatus = 'valid' | 'invalid' | null;

export interface IComment {
  id: string;
  text: string;
  authorId: string;
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

export type THandleId = 'top' | 'right' | 'bottom' | 'left';

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
  nodes: ICanvasNodeRow[];
  edges: ICanvasEdgeRow[];
  commentsByNode: Record<string, INodeCommentRow[]>;
  canvasComments: ICanvasCommentRow[];
  referenceTargets: Record<string, IReferenceTargetMeta>;
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

export interface IScreenPoint {
  x: number;
  y: number;
}

export type TMenuItemAccent = 'emerald' | 'red' | 'cyan' | 'neutral';

interface IIdScoped {
  id: string;
}

interface IThreadScoped extends IIdScoped {
  threadId: string;
}

interface IPositioned extends IThreadScoped {
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
