'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import type { IWorkspaceRole, IWorkspaceRolePermissions, TRoleEditorState } from '@interfaces';

import { useTranslations } from '@/i18n';

import { RoleEditor } from './RoleEditor';
import { RoleListItem } from './RoleListItem';

interface IRolesSectionProps {
  roles: IWorkspaceRole[];
  canManageRoles: boolean;
  onCreateRole: (name: string, icon: string, permissions: IWorkspaceRolePermissions) => Promise<boolean>;
  onUpdateRole: (
    roleId: string,
    name: string,
    icon: string,
    permissions: IWorkspaceRolePermissions,
  ) => Promise<boolean>;
  onDeleteRole: (roleId: string) => void;
}

export const RolesSection = ({
  roles,
  canManageRoles,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
}: IRolesSectionProps) => {
  const t = useTranslations();
  const { roles: copy } = t.platform.workspaceSettings;
  const [editing, setEditing] = useState<TRoleEditorState>(null);

  if (editing) {
    return (
      <RoleEditor
        role={editing.mode === 'edit' ? editing.role : null}
        onSave={(name, icon, permissions) =>
          editing.mode === 'edit'
            ? onUpdateRole(editing.role.id, name, icon, permissions)
            : onCreateRole(name, icon, permissions)
        }
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-grotesk text-xs leading-snug text-[color:var(--text-muted)]">{copy.hint}</p>
        {canManageRoles && (
          <button
            type="button"
            onClick={() => setEditing({ mode: 'create' })}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[color:var(--border-strong)] px-3 py-1.5 font-grotesk text-xs font-medium text-[color:var(--text-strong)] transition-[color,background-color,scale] duration-150 hover:bg-[color:var(--surface-overlay)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none active:scale-95 motion-reduce:transition-none"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            {copy.newRole}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {roles.map((role) => (
          <RoleListItem
            key={role.id}
            role={role}
            canManage={canManageRoles}
            onEdit={(target) => setEditing({ mode: 'edit', role: target })}
            onDelete={onDeleteRole}
          />
        ))}
      </div>
    </div>
  );
};
