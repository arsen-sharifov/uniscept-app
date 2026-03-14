'use client';

import type { ReactNode } from 'react';
import { Sidebar, Toolbar } from '@/components';
import { useToolbar } from '@/components/Toolbar';

const WorkspaceLayout = ({ children }: { children: ReactNode }) => {
  const { groups, activeTool, handleToolClick } = useToolbar();

  return (
    <div className="relative h-screen w-screen bg-neutral-100/60">
      <Sidebar />
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
