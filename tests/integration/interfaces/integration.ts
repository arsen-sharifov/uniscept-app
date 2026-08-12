export interface IIntegrationSupabaseEnv {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

export interface IIntegrationError {
  code?: string;
  message?: string;
}

export interface IIntegrationResponse<TData = unknown> {
  error: IIntegrationError | null;
  data: TData | null;
}

export interface IIntegrationAccount {
  id: string;
  email: string;
  password: string;
}

export interface IIntegrationWorkspace {
  id: string;
  name: string;
}

export interface IIntegrationThread {
  id: string;
  questionNodeId: string;
}

export interface IIntegrationNodeRow {
  label: string;
  status: string | null;
  is_answer: boolean;
  position_x: number;
  position_y: number;
}

export interface IIntegrationInvitationRow {
  status: string;
}

export interface IIntegrationRoleFlags {
  canEditCanvas?: boolean;
  canComment?: boolean;
  canManageStructure?: boolean;
  canManageMembers?: boolean;
  canManageRoles?: boolean;
  canManageWorkspace?: boolean;
}

export type TIntegrationRoleKey = 'owner' | 'member' | 'viewer';
