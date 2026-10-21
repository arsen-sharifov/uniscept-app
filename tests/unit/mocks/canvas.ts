import {
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
  Position,
  ReactFlowProvider,
  type Transform,
  useStoreApi,
} from '@xyflow/react';
import { createElement, type ReactNode, useState } from 'react';
import { vi } from 'vitest';

import {
  ECanvasNodeType,
  type IComment,
  type ICanvasNodeData,
  type INodeReference,
  type IReferenceNodeData,
  type IRichTextDocument,
  type ISaveState,
  type TCanvasEdge,
  type TCanvasNode,
  type TCanvasOperation,
  type TNodeStatus,
  type TReferenceNode,
} from '@interfaces';

import { FORMATTED_DOCUMENT, FORMATTED_TEXT } from './richText';

export const THREAD_ID = 'thread-1';

export const Canvas = vi.fn(() => null);

export const createNodeOp = (id: string, richLabel?: IRichTextDocument): TCanvasOperation => ({
  type: 'createCanvasNode',
  id,
  threadId: THREAD_ID,
  x: 0,
  y: 0,
  label: `Node ${id}`,
  ...(richLabel && { richLabel }),
});

export const updateLabelOp = (id: string, label: string, richLabel?: IRichTextDocument): TCanvasOperation => ({
  type: 'updateNodeLabel',
  id,
  label,
  ...(richLabel && { richLabel }),
});

export const updateStatusOp = (id: string, status: TNodeStatus): TCanvasOperation => ({
  type: 'updateNodeStatus',
  id,
  status,
});

export const updatePositionOp = (id: string, x: number, y: number): TCanvasOperation => ({
  type: 'updateNodePosition',
  id,
  x,
  y,
});

export const updateAnswerOp = (id: string, isAnswer: boolean): TCanvasOperation => ({
  type: 'updateNodeAnswer',
  id,
  isAnswer,
});

export const createEdgeOp = (id: string): TCanvasOperation => ({
  type: 'createEdge',
  id,
  threadId: THREAD_ID,
  source: 'node-a',
  target: 'node-b',
  sourceHandle: 'right',
  targetHandle: 'left',
});

export const createCommentOp = (id: string, richText?: IRichTextDocument): TCanvasOperation => ({
  type: 'createComment',
  id,
  nodeId: 'node-a',
  text: `Comment ${id}`,
  ...(richText && { richText }),
});

export const deleteNodeOp = (id: string): TCanvasOperation => ({ type: 'deleteNode', id });

export const deleteEdgeOp = (id: string): TCanvasOperation => ({ type: 'deleteEdge', id });

export const deleteCommentOp = (id: string): TCanvasOperation => ({ type: 'deleteComment', id });

export const canvasNode = (id: string, data?: Partial<ICanvasNodeData>): TCanvasNode => ({
  id,
  type: ECanvasNodeType.Canvas,
  position: { x: 0, y: 0 },
  data: { label: `Node ${id}`, status: null, isAnswer: false, comments: [], ...data },
});

export const questionNode = (id: string, label = 'Main question'): TCanvasNode => ({
  id,
  type: ECanvasNodeType.Question,
  position: { x: 0, y: 0 },
  data: { label, status: null, isAnswer: false, comments: [] },
});

export const referenceNode = (id: string, data?: Partial<IReferenceNodeData>): TReferenceNode => ({
  id,
  type: ECanvasNodeType.Reference,
  position: { x: 0, y: 0 },
  data: {
    label: 'Ref',
    sourceNodeId: 'origin',
    sourceNodeLabel: 'Origin node',
    sourceThreadId: 'th-2',
    sourceThreadName: 'Other thread',
    sourceWorkspaceId: 'ws-2',
    sourceWorkspaceName: 'Other workspace',
    ...data,
  },
});

export const createReferenceNodeOp = (id: string): TCanvasOperation => ({
  type: 'createReferenceNode',
  id,
  threadId: THREAD_ID,
  x: 0,
  y: 0,
  data: referenceNode(id).data,
});

export const nodeProps = <TNode extends Node>(node: TNode, selected = false): NodeProps<TNode> =>
  ({
    id: node.id,
    data: node.data,
    selected,
    type: node.type,
    dragging: false,
    zIndex: 0,
    isConnectable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    selectable: true,
    deletable: true,
    draggable: true,
    width: 240,
    height: 96,
  }) as unknown as NodeProps<TNode>;

export const canvasEdge = (id: string, source: string, target: string): Edge => ({
  id,
  source,
  target,
  sourceHandle: 'right',
  targetHandle: 'left',
  type: 'default',
});

export const edgeProps = (edge: TCanvasEdge): EdgeProps<TCanvasEdge> =>
  ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandleId: edge.sourceHandle,
    targetHandleId: edge.targetHandle,
    sourceX: 0,
    sourceY: 0,
    targetX: 200,
    targetY: 100,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: edge.style,
    data: edge.data,
  }) as EdgeProps<TCanvasEdge>;

export const overflowLabels = () => {
  Object.defineProperty(HTMLDivElement.prototype, 'scrollHeight', { configurable: true, value: 200 });
  Object.defineProperty(HTMLDivElement.prototype, 'clientHeight', { configurable: true, value: 100 });
};

export const resetLabelOverflow = () => {
  Reflect.deleteProperty(HTMLDivElement.prototype, 'scrollHeight');
  Reflect.deleteProperty(HTMLDivElement.prototype, 'clientHeight');
};

const PANNED_TRANSFORM: Transform = [20, 40, 2];

const PannedViewport = ({ children }: { children: ReactNode }) => {
  const flow = useStoreApi();
  useState(() => flow.setState({ domNode: document.createElement('div'), transform: PANNED_TRANSFORM }));

  return children;
};

export const PannedFlowProvider = ({ children }: { children: ReactNode }) =>
  createElement(ReactFlowProvider, null, createElement(PannedViewport, null, children));

export const measuredNode = (id: string, x: number, y: number, width: number, height: number): Node => ({
  id,
  position: { x, y },
  measured: { width, height },
  data: {},
});

export const bareNode = (id: string, x: number, y: number): Node => ({
  id,
  position: { x, y },
  data: {},
});

export const comment = (id: string, overrides?: Partial<IComment>): IComment => ({
  id,
  text: `Comment ${id}`,
  authorId: 'user-1',
  ...overrides,
});

export const nodeReference = (id: string): INodeReference => ({
  id,
  label: `Ref ${id}`,
  threadId: 'thread-2',
  threadName: 'Other thread',
  workspaceId: 'ws-1',
  workspaceName: 'Workspace one',
});

export const saveState = (overrides: Partial<ISaveState>): ISaveState => ({
  status: 'idle',
  lastSavedAt: null,
  retryAttempt: 0,
  pendingCount: 0,
  failedCount: 0,
  ...overrides,
});

export const WORKSPACE_ID = 'ws-1';
export const REFERENCE_TARGET_URL = '/platform/ws-2/th-2?focus=ref&node=origin';

export const CANVAS_CONTENT = {
  nodes: [questionNode('q'), canvasNode('n1')],
  edges: [canvasEdge('e1', 'q', 'n1')],
};

export const MIXED_COMMENT_THREAD: IComment[] = [
  comment('c1', { authorId: 'user-1', text: 'Mine' }),
  comment('c2', { authorId: 'user-2', text: FORMATTED_TEXT, richText: FORMATTED_DOCUMENT }),
];

export const formattedQuestionNode = (id: string): TCanvasNode => {
  const node = questionNode(id, FORMATTED_TEXT);

  return { ...node, data: { ...node.data, richLabel: FORMATTED_DOCUMENT } };
};
