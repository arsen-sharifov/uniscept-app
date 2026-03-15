'use client';

import { type ReactNode, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar, Toolbar } from '@/components';
import { useToolbar } from '@/components/Toolbar';
import { usePlatformStore } from '@/lib/stores';

interface IWorkspaceLayoutProps {
  children: ReactNode;
}

const WorkspaceLayout = ({ children }: IWorkspaceLayoutProps) => {
  const { groups, activeTool, handleToolClick } = useToolbar();
  const router = useRouter();
  const params = useParams();

  const workspaceId = params?.workspaceId as string | undefined;
  const threadId = params?.threadId as string | undefined;

  const workspaces = usePlatformStore((s) => s.workspaces);
  const activeWorkspaceId = usePlatformStore((s) => s.activeWorkspaceId);
  const navItems = usePlatformStore((s) => s.navItems);
  const loading = usePlatformStore((s) => s.loading);
  const loadWorkspaces = usePlatformStore((s) => s.loadWorkspaces);
  const selectWorkspace = usePlatformStore((s) => s.selectWorkspace);
  const createWorkspace = usePlatformStore((s) => s.createWorkspace);
  const createTopic = usePlatformStore((s) => s.createTopic);
  const deleteTopic = usePlatformStore((s) => s.deleteTopic);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  useEffect(() => {
    if (workspaceId && workspaceId !== activeWorkspaceId) {
      selectWorkspace(workspaceId);
    }
  }, [workspaceId, activeWorkspaceId, selectWorkspace]);

  const handleItemClick = (id: string) => {
    if (activeWorkspaceId) {
      router.push(`/platform/${activeWorkspaceId}/${id}`);
    }
  };

  const handleWorkspaceSelect = async (id: string) => {
    await selectWorkspace(id);
    router.push('/platform');
  };

  const handleCreateWorkspace = async () => {
    const name = prompt('Workspace name:');
    if (!name) return;
    const ws = await createWorkspace(name);
    await selectWorkspace(ws.id);
    router.push('/platform');
  };

  const handleCreateTopic = async (parentId?: string) => {
    const name = prompt('Topic name:');
    if (!name) return;
    const topicId = await createTopic(name, parentId);
    if (activeWorkspaceId) {
      router.push(`/platform/${activeWorkspaceId}/${topicId}`);
    }
  };

  const handleDeleteItem = async (id: string) => {
    await deleteTopic(id);
    if (threadId === id) {
      router.push('/platform');
    }
  };

  if (loading) return null;

  return (
    <div className="relative h-screen w-screen bg-neutral-100/60">
      <Sidebar
        items={navItems}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId ?? undefined}
        activeItemId={threadId}
        onItemClick={handleItemClick}
        onDeleteItem={handleDeleteItem}
        onCreateTopic={handleCreateTopic}
        onWorkspaceSelect={handleWorkspaceSelect}
        onCreateWorkspace={handleCreateWorkspace}
      />
      <Toolbar
        groups={groups}
        activeTool={activeTool}
        onToolClick={handleToolClick}
      />
      {children}
    </div>
  );
};

export default WorkspaceLayout;
