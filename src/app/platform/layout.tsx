'use client';

import { useState, type ReactNode } from 'react';
import { Sidebar, Toolbar, useToolbar } from '@/components';
import { Settings } from './components/Settings';
import { UserMenu } from './components/UserMenu';
import { useWorkspaceManager } from './hooks';

const WorkspaceLayout = ({ children }: { children: ReactNode }) => {
  const { groups, activeTool, handleToolClick } = useToolbar();
  const [settingsOpen, setSettingsOpen] = useState(false);

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
  } = useWorkspaceManager();

  return (
    <div className="relative h-screen w-screen bg-neutral-100/60">
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
        footer={<UserMenu onSettingsClick={() => setSettingsOpen(true)} />}
      />
      <Toolbar
        groups={groups}
        activeTool={activeTool}
        onToolClick={handleToolClick}
      />
      {children}
      {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
    </div>
  );
};

export default WorkspaceLayout;
