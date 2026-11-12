import type { ISize, TNodeStatus, TTranslations } from '@interfaces';

export type TE2ERoleKey = 'owner' | 'member' | 'viewer';

export interface IE2ESupabaseEnv {
  url: string;
  serviceRoleKey: string;
}

export interface IE2ESeededAccount {
  id: string;
  email: string;
  name: string;
  password: string;
}

export interface IE2EAccount extends IE2ESeededAccount {
  storageStatePath: string;
}

export interface IE2EWorkspace {
  id: string;
  name: string;
}

export interface IE2EFolder {
  id: string;
  name: string;
}

export interface IE2ERolePermissions {
  canEditCanvas?: boolean;
  canComment?: boolean;
}

export interface IE2EThread {
  id: string;
  name: string;
  questionNodeId: string;
}

export interface IE2ENodeSeed {
  label: string;
  x: number;
  y: number;
  status?: NonNullable<TNodeStatus>;
}

export interface IE2EMailboxSearch {
  messages: { ID: string }[];
}

export interface IE2EMailMessage {
  Subject: string;
  Text: string;
}

export interface IE2EWorkerFixtures {
  account: IE2EAccount;
}

export interface IE2ETestFixtures {
  workspace: IE2EWorkspace;
}

export interface IE2ETranslation {
  name: string;
  locale: string;
  copy: TTranslations;
}

export interface IE2EScreenSize {
  name: string;
  viewport: ISize;
}
