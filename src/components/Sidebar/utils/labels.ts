import type { TNavItemType, TSingleDeleteTitleKey } from '@interfaces';

export const getSingleDeleteTitleKey = (type: 'workspace' | TNavItemType): TSingleDeleteTitleKey => {
  if (type === 'workspace') return 'deleteWorkspaceTitle';
  if (type === 'folder') return 'deleteFolderTitle';
  return 'deleteThreadTitle';
};
