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
