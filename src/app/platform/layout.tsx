'use client';

import { useState, type ReactNode } from 'react';
import { Sidebar, Toolbar, useToolbar } from '@/components';
import { Settings } from './components/Settings';

const WorkspaceLayout = ({ children }: { children: ReactNode }) => {
  const { groups, activeTool, handleToolClick } = useToolbar();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="relative h-screen w-screen bg-neutral-100/60">
      <Sidebar onSettingsClick={() => setSettingsOpen(true)} />
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
