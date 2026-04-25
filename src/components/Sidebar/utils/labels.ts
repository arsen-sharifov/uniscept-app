import type { TNavItemType } from '@interfaces';

export type TSingleDeleteTitleKey =
  | 'deleteWorkspaceTitle'
  | 'deleteFolderTitle'
  | 'deleteThreadTitle';

export const getSingleDeleteTitleKey = (
  type: 'workspace' | TNavItemType
): TSingleDeleteTitleKey => {
  if (type === 'workspace') return 'deleteWorkspaceTitle';
  if (type === 'folder') return 'deleteFolderTitle';
  return 'deleteThreadTitle';
};
