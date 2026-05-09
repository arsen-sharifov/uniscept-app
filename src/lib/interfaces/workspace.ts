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

export interface IThread {
  id: string;
  workspaceId: string;
  folderId: string | null;
  name: string;
  position: number;
}

export interface INodeReference {
  id: string;
  label: string;
  threadId: string;
  threadName: string;
  workspaceId: string;
  workspaceName: string;
}
