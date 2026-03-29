import type { Node, Edge } from '@xyflow/react';

export interface IWorkspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  position: number;
}

export interface IFolder {
  id: string;
  workspaceId: string;
  parentFolderId: string | null;
  name: string;
  position: number;
}

export interface ICanvasData {
  nodes: Node[];
  edges: Edge[];
}

export interface IThread {
  id: string;
  workspaceId: string;
  folderId: string | null;
  name: string;
  canvasData: ICanvasData;
  position: number;
}

export interface IThreadReference {
  id: string;
  name: string;
  workspaceId: string;
  workspaceName: string;
}
