import type { Node } from '@xyflow/react';

export type TNodeStatus = 'valid' | 'invalid' | null;

export interface IComment {
  id: string;
  text: string;
}

export interface ICanvasNodeData {
  label: string;
  status: TNodeStatus;
  comments: IComment[];
  [key: string]: unknown;
}

export type TCanvasNode = Node<ICanvasNodeData>;

export interface IReferenceNodeData {
  label: string;
  sourceThreadId: string;
  sourceThreadName: string;
  sourceWorkspaceId: string;
  [key: string]: unknown;
}

export type TReferenceNode = Node<IReferenceNodeData>;

export type THandleId = 'top' | 'right' | 'bottom' | 'left';
