import type {
  Edge,
  EdgeMouseHandler,
  FitViewOptions,
  IsValidConnection,
  Node,
  NodeMouseHandler,
  OnConnect,
  OnMoveEnd,
  Position,
  Viewport,
} from '@xyflow/react';
import type { LucideIcon } from 'lucide-react';
import type { FocusEvent, KeyboardEvent, MouseEvent, RefObject } from 'react';

import type { TDefaultZoom } from './preferences';

export enum ECanvasNodeType {
  Canvas = 'canvas-node',
  Reference = 'reference-node',
  Question = 'question-node',
}

export type TNodeStatus = 'valid' | 'invalid' | null;

export type TNodeBandTone = 'question' | 'reference' | 'answer' | 'valid' | 'invalid' | 'affected' | 'open';

export type THandleId = 'top' | 'right' | 'bottom' | 'left';

export type TFitPadding = NonNullable<FitViewOptions['padding']>;

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
  isAnswer: boolean;
  comments: IComment[];
  createdBy?: string;
  isNew?: boolean;
  eligibleHint?: boolean;
  effectiveStatus?: TEffectiveStatus;
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
  createdBy?: string;
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
}

export type TSaveStatus = 'idle' | 'saving' | 'retrying' | 'saved' | 'error' | 'offline';

export type TVisibleSaveStatus = Extract<TSaveStatus, 'retrying' | 'error' | 'offline'>;

export type TValidationAction = 'valid' | 'answer';

export interface ISaveState {
  status: TSaveStatus;
  lastSavedAt: number | null;
  retryAttempt: number;
  pendingCount: number;
  failedCount: number;
}

export type TEdgeTone = 'default' | 'valid' | 'answer' | 'invalid' | 'tainted';

export interface ICanvasEdgeData extends Record<string, unknown> {
  tone?: TEdgeTone;
  bidirectional?: boolean;
}

export type TCanvasEdge = Edge<ICanvasEdgeData>;

export interface ICanvasEdgeGeometry {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourceSide: THandleId;
  targetSide: THandleId;
  bidirectional?: boolean;
}

export type TEffectiveStatus = TNodeStatus | 'tainted' | 'tainted-valid';

export interface IAlignmentGuide {
  direction: 'vertical' | 'horizontal';
  position: number;
  start: number;
  end: number;
}

export interface ISpan {
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

interface ICreateCanvasNodeOperation extends IPositioned {
  type: 'createCanvasNode';
  label: string;
}

interface ICreateReferenceNodeOperation extends IPositioned {
  type: 'createReferenceNode';
  data: IReferenceNodeData;
}

interface IDeleteNodeOperation extends IIdScoped {
  type: 'deleteNode';
}

interface IUpdateNodePositionOperation extends IIdScoped {
  type: 'updateNodePosition';
  x: number;
  y: number;
}

interface IUpdateNodeLabelOperation extends IIdScoped {
  type: 'updateNodeLabel';
  label: string;
}

interface IUpdateNodeStatusOperation extends IIdScoped {
  type: 'updateNodeStatus';
  status: TNodeStatus;
}

interface IUpdateNodeAnswerOperation extends IIdScoped {
  type: 'updateNodeAnswer';
  isAnswer: boolean;
}

interface ICreateEdgeOperation extends IThreadScoped {
  type: 'createEdge';
  source: string;
  target: string;
  sourceHandle: THandleId;
  targetHandle: THandleId;
}

interface IDeleteEdgeOperation extends IIdScoped {
  type: 'deleteEdge';
}

interface ICreateNodeCommentOperation extends IIdScoped {
  type: 'createComment';
  nodeId: string;
  text: string;
}

interface IDeleteNodeCommentOperation extends IIdScoped {
  type: 'deleteComment';
}

export type TNodeOperation =
  | ICreateCanvasNodeOperation
  | ICreateReferenceNodeOperation
  | IDeleteNodeOperation
  | IUpdateNodePositionOperation
  | IUpdateNodeLabelOperation
  | IUpdateNodeStatusOperation
  | IUpdateNodeAnswerOperation;

export type TNodeUpdateOperation =
  IUpdateNodePositionOperation | IUpdateNodeLabelOperation | IUpdateNodeStatusOperation | IUpdateNodeAnswerOperation;

export type TEdgeOperation = ICreateEdgeOperation | IDeleteEdgeOperation;

export type TCommentOperation = ICreateNodeCommentOperation | IDeleteNodeCommentOperation;

export type TCanvasOperation = TNodeOperation | TEdgeOperation | TCommentOperation;

export interface ICanvasNodeRow {
  id: string;
  thread_id: string;
  type: ECanvasNodeType;
  position_x: number;
  position_y: number;
  label: string;
  status: TNodeStatus;
  is_answer: boolean;
  source_node_id: string | null;
  created_by: string | null;
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

export interface IReferenceSearchInput {
  workspaceId: string;
  threadId: string;
}

export interface IReferenceSearchResult {
  nodes: INodeReference[];
  loading: boolean;
}

export interface IReferenceSearchResponse {
  request: IReferenceSearchInput;
  nodes: INodeReference[];
}

export interface ICanvasSkeletonNode {
  id: string;
  x: number;
  y: number;
  width: number;
  lines: number;
}

export interface IHandlePosition {
  id: THandleId;
  position: Position;
}

export interface INodeBandStyle {
  icon: LucideIcon;
  color: string;
}

export interface INodeStateBand {
  active: boolean;
  tone: TNodeBandTone;
  label: string;
}

export interface IUseCanvasSyncResult {
  saveState: ISaveState;
  loadError: Error | null;
}

export interface IUseCanvasToolsResult {
  onPaneClick: (event: MouseEvent) => void;
  onNodeClick: NodeMouseHandler;
  onNodeDoubleClick: NodeMouseHandler;
  onEdgeClick: EdgeMouseHandler;
  onConnect: OnConnect;
  isValidConnection: IsValidConnection;
}

export interface IUseCanvasViewportOptions {
  threadId: string;
  defaultZoom: TDefaultZoom;
}

export interface IUseCanvasViewportResult {
  defaultViewport: Viewport;
  arriving: boolean;
  onMoveEnd: OnMoveEnd;
}

export interface IUseCanvasContextMenuResult {
  contextMenu: TCanvasContextMenu | null;
  closeContextMenu: () => void;
  onPaneContextMenu: (event: MouseEvent | globalThis.MouseEvent) => void;
  onNodeContextMenu: NodeMouseHandler;
  onEdgeContextMenu: EdgeMouseHandler;
}

export interface IUseLabelEditingOptions {
  id: string;
  label: string;
  measured: boolean;
  signalLabelled?: boolean;
}

export interface IUseLabelEditingResult {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  handleLabelBlur: (event: FocusEvent<HTMLTextAreaElement>) => void;
  handleLabelKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
}

export type TCanvasOperationListener = (operation: TCanvasOperation) => void;

export type TSaveStatusListener = (state: ISaveState) => void;

export type TFailedOperationsListener = (failed: TCanvasOperation[]) => void;

export interface ICanvasQueueState {
  pending: TCanvasOperation[];
  failed: TCanvasOperation[];
  flushTimer: number | null;
  retryTimer: number | null;
  pollTimer: number | null;
  retries: number;
  inflight: TCanvasOperation[] | null;
  retryRequested: boolean;
  online: boolean;
  saveState: ISaveState;
  listeners: Set<TSaveStatusListener>;
  failedListeners: Set<TFailedOperationsListener>;
  windowListenersBound: boolean;
}
