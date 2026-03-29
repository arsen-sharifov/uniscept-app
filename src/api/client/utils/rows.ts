import type {
  IFolder,
  IFolderRow,
  IThread,
  IThreadRow,
  IWorkspace,
  IWorkspaceRow,
} from '@interfaces';

export const toWorkspace = (row: IWorkspaceRow): IWorkspace => ({
  id: row.id,
  name: row.name,
  ownerId: row.owner_id,
  createdAt: row.created_at,
  position: row.position,
});

export const toFolder = (row: IFolderRow): IFolder => ({
  id: row.id,
  workspaceId: row.workspace_id,
  parentFolderId: row.parent_folder_id ?? null,
  name: row.name,
  position: row.position,
});

export const toThread = (row: IThreadRow): Omit<IThread, 'canvasData'> => ({
  id: row.id,
  workspaceId: row.workspace_id,
  folderId: row.folder_id ?? null,
  name: row.name,
  position: row.position,
});
