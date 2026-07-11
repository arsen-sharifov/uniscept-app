'use client';

import { create } from 'zustand';

import type { IWorkspaceAccess } from '@interfaces';

interface IPermissionsState {
  userId: string | null;
  workspaceId: string | null;
  isOwner: boolean;
  canEditCanvas: boolean;
  canComment: boolean;
  canManageStructure: boolean;
  canManageMembers: boolean;
  canManageRoles: boolean;
  canManageWorkspace: boolean;
}

interface IPermissionsStore extends IPermissionsState {
  setAccess: (workspaceId: string, userId: string | null, access: IWorkspaceAccess | null) => void;
  clearAccess: () => void;
}

const NO_ACCESS = {
  isOwner: false,
  canEditCanvas: false,
  canComment: false,
  canManageStructure: false,
  canManageMembers: false,
  canManageRoles: false,
  canManageWorkspace: false,
} as const;

const INITIAL: IPermissionsState = {
  userId: null,
  workspaceId: null,
  ...NO_ACCESS,
};

export const usePermissionsStore = create<IPermissionsStore>()((set) => ({
  ...INITIAL,
  setAccess: (workspaceId, userId, access) => set({ workspaceId, userId, ...(access ?? NO_ACCESS) }),
  clearAccess: () => set(INITIAL),
}));
