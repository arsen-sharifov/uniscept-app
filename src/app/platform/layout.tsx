import type { ReactNode } from 'react';
import { Sidebar, Toolbar } from '@/components';

const WorkspaceLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative h-screen w-screen bg-neutral-100/60">
      <Sidebar />
      <Toolbar />
      {children}
    </div>
  );
};

export default WorkspaceLayout;
