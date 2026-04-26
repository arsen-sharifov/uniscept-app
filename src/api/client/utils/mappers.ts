import type {
  ICanvasCommentRow,
  ICanvasNodeWithThreadRow,
  IComment,
  IFolder,
  IFolderRow,
  INodeCommentRow,
  INodeReference,
  IReferenceTargetMeta,
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

export const toThread = (row: IThreadRow): IThread => ({
  id: row.id,
  workspaceId: row.workspace_id,
  folderId: row.folder_id ?? null,
  name: row.name,
  position: row.position,
});

export const toComment = (row: INodeCommentRow | ICanvasCommentRow): IComment => ({
  id: row.id,
  text: row.text,
  authorId: row.author_id,
});

export const toReferenceTargetMeta = (row: ICanvasNodeWithThreadRow): IReferenceTargetMeta => ({
  nodeLabel: row.label,
  threadId: row.threads?.id ?? row.thread_id,
  threadName: row.threads?.name ?? '',
  workspaceId: row.threads?.workspace_id ?? '',
  workspaceName: row.threads?.workspaces?.name ?? '',
});

export const toNodeReference = (row: ICanvasNodeWithThreadRow): INodeReference => ({
  id: row.id,
  label: row.label,
  threadId: row.threads?.id ?? row.thread_id,
  threadName: row.threads?.name ?? '',
  workspaceId: row.threads?.workspace_id ?? '',
  workspaceName: row.threads?.workspaces?.name ?? '',
});
