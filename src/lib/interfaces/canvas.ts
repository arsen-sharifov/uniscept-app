import type { Node } from '@xyflow/react';

export interface ITopic {
  id: string;
  name: string;
  workspaceId: string;
  workspaceName: string;
}

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
  sourceTopicId: string;
  sourceTopicName: string;
  sourceWorkspaceId: string;
  [key: string]: unknown;
}

export type TReferenceNode = Node<IReferenceNodeData>;

export enum ECanvasTool {
  Select = 'select',
  Pan = 'pan',
  AddNode = 'add-node',
  Connect = 'connect',
  Delete = 'delete',
  ValidPath = 'valid-path',
  InvalidPath = 'invalid-path',
  CrossReference = 'cross-reference',
  Undo = 'undo',
  Redo = 'redo',
}
