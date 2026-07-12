import {
  ECanvasNodeType,
  type ICanvasEdgeRow,
  type ICanvasNodeRow,
  type ICanvasNodeWithThreadRow,
  type IFolderRow,
  type IMyInvitationRow,
  type IMyWorkspaceRow,
  type INodeCommentRow,
  type IThreadRow,
  type IWorkspaceAccessRow,
  type IWorkspaceInvitationRow,
  type IWorkspaceMemberRow,
  type IWorkspaceRoleRow,
  type IWorkspaceRow,
} from '@interfaces';

export const workspaceRow = (overrides?: Partial<IWorkspaceRow>): IWorkspaceRow => ({
  id: 'ws-1',
  name: 'Workspace',
  owner_id: 'user-1',
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

export const myWorkspaceRow = (overrides?: Partial<IMyWorkspaceRow>): IMyWorkspaceRow => ({
  id: 'ws-1',
  name: 'Workspace',
  can_manage_workspace: false,
  ...overrides,
});

export const workspaceAccessRow = (overrides?: Partial<IWorkspaceAccessRow>): IWorkspaceAccessRow => ({
  is_owner: false,
  can_edit_canvas: true,
  can_comment: true,
  can_manage_structure: false,
  can_manage_members: false,
  can_manage_roles: false,
  can_manage_workspace: false,
  ...overrides,
});

export const folderRow = (overrides?: Partial<IFolderRow>): IFolderRow => ({
  id: 'folder-1',
  workspace_id: 'ws-1',
  parent_folder_id: null,
  name: 'Folder',
  position: 0,
  ...overrides,
});

export const threadRow = (overrides?: Partial<IThreadRow>): IThreadRow => ({
  id: 'th-1',
  workspace_id: 'ws-1',
  folder_id: null,
  name: 'Thread',
  position: 0,
  ...overrides,
});

export const nodeCommentRow = (overrides?: Partial<INodeCommentRow>): INodeCommentRow => ({
  id: 'c-1',
  node_id: 'n1',
  author_id: 'user-1',
  text: 'Comment',
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

export const canvasNodeRow = (overrides?: Partial<ICanvasNodeRow>): ICanvasNodeRow => ({
  id: 'n1',
  thread_id: 'th-1',
  type: ECanvasNodeType.Canvas,
  position_x: 10,
  position_y: 20,
  label: 'Node',
  status: null,
  is_answer: false,
  source_node_id: null,
  created_by: 'user-1',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

export const canvasEdgeRow = (overrides?: Partial<ICanvasEdgeRow>): ICanvasEdgeRow => ({
  id: 'e1',
  thread_id: 'th-1',
  source_node_id: 'n1',
  target_node_id: 'n2',
  source_handle: 'right',
  target_handle: 'left',
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

export const canvasNodeWithThreadRow = (overrides?: Partial<ICanvasNodeWithThreadRow>): ICanvasNodeWithThreadRow => ({
  id: 'n1',
  label: 'Origin node',
  thread_id: 'th-1',
  threads: {
    id: 'th-1',
    name: 'Thread',
    workspace_id: 'ws-1',
    workspaces: { name: 'Workspace' },
  },
  ...overrides,
});

export const workspaceRoleRow = (overrides?: Partial<IWorkspaceRoleRow>): IWorkspaceRoleRow => ({
  id: 'role-1',
  key: 'member',
  name: 'Member',
  icon: null,
  is_system: true,
  is_owner: false,
  can_edit_canvas: true,
  can_comment: true,
  can_manage_structure: false,
  can_manage_members: false,
  can_manage_roles: false,
  can_manage_workspace: false,
  member_count: 2,
  ...overrides,
});

export const workspaceMemberRow = (overrides?: Partial<IWorkspaceMemberRow>): IWorkspaceMemberRow => ({
  user_id: 'user-1',
  role_id: 'role-1',
  role_key: 'member',
  role_name: 'Member',
  is_owner: false,
  joined_at: '2026-01-01T00:00:00Z',
  name: 'Arsen',
  email: 'user@example.com',
  avatar_icon: 'cat',
  ...overrides,
});

export const workspaceInvitationRow = (overrides?: Partial<IWorkspaceInvitationRow>): IWorkspaceInvitationRow => ({
  id: 'inv-1',
  email: 'invitee@example.com',
  role_id: 'role-1',
  role_key: 'member',
  role_name: 'Member',
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

export const myInvitationRow = (overrides?: Partial<IMyInvitationRow>): IMyInvitationRow => ({
  id: 'inv-1',
  workspace_id: 'ws-1',
  workspace_name: 'Workspace',
  role_key: 'member',
  role_name: 'Member',
  invited_by_name: 'Owner',
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
});
