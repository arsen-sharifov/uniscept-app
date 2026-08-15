'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import type { TWorkspaceSettingsSection } from '@interfaces';

import { Modal } from '@/components';
import { useTranslations } from '@/i18n';

import { GeneralSection, MembersSection, RolesSection, WorkspaceSettingsSkeleton } from './fragments';
import { useWorkspaceSettings } from './hooks';
import { WorkspaceSettingsSidebar } from './WorkspaceSettingsSidebar';

interface IWorkspaceSettingsProps {
  workspaceId: string;
  workspaceName: string;
  onRename: (id: string, name: string) => Promise<void> | void;
  onWorkspacesChanged?: () => void;
  onClose: () => void;
}

export const WorkspaceSettings = ({
  workspaceId,
  workspaceName,
  onRename,
  onWorkspacesChanged,
  onClose,
}: IWorkspaceSettingsProps) => {
  const t = useTranslations();
  const [activeSection, setActiveSection] = useState<TWorkspaceSettingsSection>('general');
  const settings = useWorkspaceSettings(workspaceId, onWorkspacesChanged);

  const renderSection = () => {
    if (settings.loading) {
      return <WorkspaceSettingsSkeleton section={activeSection} />;
    }

    if (activeSection === 'general') {
      return (
        <GeneralSection
          workspaceId={workspaceId}
          initialName={workspaceName}
          createdAt={settings.workspace?.createdAt ?? null}
          memberCount={settings.members.length}
          currentRoleName={settings.currentRoleName}
          canManageWorkspace={settings.canManageWorkspace}
          onRename={onRename}
        />
      );
    }

    if (activeSection === 'members') {
      return (
        <MembersSection
          members={settings.members}
          roles={settings.roles}
          invitations={settings.invitations}
          currentUserId={settings.currentUserId}
          canManageMembers={settings.canManageMembers}
          onAssignRole={settings.assignRole}
          onRemoveMember={settings.removeMember}
          onTransferOwnership={settings.transferOwnership}
          onInvite={settings.invite}
          onRevokeInvitation={settings.revokeInvitation}
        />
      );
    }

    return (
      <RolesSection
        roles={settings.roles}
        canManageRoles={settings.canManageRoles}
        onCreateRole={settings.createRole}
        onUpdateRole={settings.updateRole}
        onDeleteRole={settings.deleteRole}
      />
    );
  };

  return (
    <Modal open onClose={onClose} width="max-w-[960px]" overflowHidden>
      <div className="relative flex h-[86vh] rounded-2xl font-grotesk text-[color:var(--text)]">
        <WorkspaceSettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        <button
          type="button"
          onClick={onClose}
          aria-label={t.platform.workspaceSettings.close}
          className="absolute top-4 right-4 z-10 cursor-pointer rounded-lg p-1.5 text-[color:var(--text-muted)] transition-[color,background-color,scale] duration-150 hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none active:scale-95 motion-reduce:transition-none"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <div className="min-w-0 flex-1 [scrollbar-width:none] overflow-y-auto px-10 py-8 [&::-webkit-scrollbar]:hidden">
          <h2 className="mb-6 font-grotesk text-lg font-semibold tracking-tight text-[color:var(--text-strong)]">
            {t.platform.workspaceSettings.sections[activeSection]}
          </h2>

          {renderSection()}
        </div>
      </div>
    </Modal>
  );
};
