import { Canvas, Toolbar, useToolbar } from '@/components';

interface ICanvasWithExportProps {
  workspaceId: string;
  threadId: string;
}

export const CanvasWithExport = ({ workspaceId, threadId }: ICanvasWithExportProps) => {
  const { groups, activeTool, handleToolClick } = useToolbar();

  return (
    <div className="flex h-full gap-3 p-3">
      <div className="relative min-w-0 flex-1">
        <Canvas workspaceId={workspaceId} threadId={threadId} />
      </div>
      <Toolbar
        groups={groups}
        activeTool={activeTool}
        onToolClick={handleToolClick}
        threadId={threadId}
        threadName="Canvas export — Рішення"
      />
    </div>
  );
};
