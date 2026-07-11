import type { TTranslations, TWorkspaceRoleKey } from '@interfaces';

export const roleLabel = (key: TWorkspaceRoleKey | null, name: string, t: TTranslations): string =>
  key ? t.platform.workspaceSettings.roleNames[key] : name;

export const canEditNode = (
  createdBy: unknown,
  access: { userId: string | null; isOwner: boolean; canEditCanvas: boolean },
): boolean => access.canEditCanvas && (access.isOwner || createdBy === access.userId);
