'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { Sidebar, Toolbar, useToolbar } from '@/components';

import { Settings } from './components/Settings';
import { usePreferences } from './components/Settings/hooks';
import { UserMenu } from './components/UserMenu';
import { WorkspaceSettings } from './components/WorkspaceSettings';
import { useWorkspaceManager } from './hooks';

const WorkspaceLayout = ({ children }: { children: ReactNode }) => {
  const { groups, activeTool, handleToolClick } = useToolbar();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [workspaceSettingsId, setWorkspaceSettingsId] = useState<string | null>(null);
  const { preferences, updatePreference } = usePreferences();

  useEffect(() => {
    document.documentElement.setAttribute('data-has-toolbar', '');

    return () => document.documentElement.removeAttribute('data-has-toolbar');
  }, []);

  const {
    workspaces,
    activeWorkspaceId,
    navItems,
    activeThreadId,
    onWorkspaceSelect,
    onCreateWorkspace,
    onRenameWorkspace,
    onDeleteWorkspace,
    onMoveWorkspace,
    onCreateThread,
    onCreateFolder,
    onDeleteItem,
    onRenameItem,
    onItemClick,
    onMoveItem,
    onBulkDelete,
    onBulkMove,
    onBulkDeleteWorkspaces,
    editingItemId,
    clearEditingItemId,
    editingWorkspaceId,
    clearEditingWorkspaceId,
    invitations,
    onAcceptInvitation,
    onDeclineInvitation,
    reloadWorkspaces,
  } = useWorkspaceManager();

  const workspaceSettingsTarget = workspaces.find((workspace) => workspace.id === workspaceSettingsId);

  return (
    <div className="relative h-screen w-screen bg-[color:var(--app-bg-tint)] transition-colors duration-300 ease-out">
      <Sidebar
        items={navItems}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId ?? undefined}
        activeItemId={activeThreadId}
        onItemClick={onItemClick}
        onDeleteItem={onDeleteItem}
        onRenameItem={onRenameItem}
        onCreateThread={onCreateThread}
        onCreateFolder={onCreateFolder}
        onMoveItem={onMoveItem}
        onBulkDelete={onBulkDelete}
        onBulkMove={onBulkMove}
        onBulkDeleteWorkspaces={onBulkDeleteWorkspaces}
        editingItemId={editingItemId}
        onEditingComplete={clearEditingItemId}
        editingWorkspaceId={editingWorkspaceId}
        onWorkspaceEditingComplete={clearEditingWorkspaceId}
        onWorkspaceSelect={onWorkspaceSelect}
        onCreateWorkspace={onCreateWorkspace}
        onRenameWorkspace={onRenameWorkspace}
        onDeleteWorkspace={onDeleteWorkspace}
        onMoveWorkspace={onMoveWorkspace}
        onOpenWorkspaceSettings={setWorkspaceSettingsId}
        invitations={invitations}
        onAcceptInvitation={onAcceptInvitation}
        onDeclineInvitation={onDeclineInvitation}
        footer={<UserMenu onSettingsClick={() => setSettingsOpen(true)} />}
      />
      <Toolbar groups={groups} activeTool={activeTool} onToolClick={handleToolClick} />
      {children}
      {settingsOpen && (
        <Settings
          onClose={() => setSettingsOpen(false)}
          preferences={preferences}
          updatePreference={updatePreference}
        />
      )}
      {workspaceSettingsTarget && (
        <WorkspaceSettings
          workspaceId={workspaceSettingsTarget.id}
          workspaceName={workspaceSettingsTarget.name}
          onRename={onRenameWorkspace}
          onWorkspacesChanged={reloadWorkspaces}
          onClose={() => setWorkspaceSettingsId(null)}
        />
      )}
    </div>
  );
};

export default WorkspaceLayout;
