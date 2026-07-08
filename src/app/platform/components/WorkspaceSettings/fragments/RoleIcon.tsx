import type { IWorkspaceRole } from '@interfaces';

import { CUSTOM_ROLE_ICON, ROLE_ICON_MAP, SYSTEM_ROLE_ICONS } from '../consts';

export interface IRoleIconProps {
  role: IWorkspaceRole;
  className?: string;
}

export const RoleIcon = ({ role, className }: IRoleIconProps) => {
  const Icon = role.key ? SYSTEM_ROLE_ICONS[role.key] : (ROLE_ICON_MAP[role.icon ?? ''] ?? CUSTOM_ROLE_ICON);

  return <Icon className={className} aria-hidden />;
};
