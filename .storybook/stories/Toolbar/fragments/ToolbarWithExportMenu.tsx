import { useEffect, useRef } from 'react';

import { useCanvasStore } from '@/lib/stores';

import { ToolbarWithState } from './ToolbarWithState';

interface IToolbarWithExportMenuProps {
  threadId: string;
  threadName: string;
}

export const ToolbarWithExportMenu = ({ threadId, threadName }: IToolbarWithExportMenuProps) => {
  const ready = useCanvasStore((state) => state.hydrated && state.threadId === threadId && state.nodes.length > 0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ready)
      rootRef.current?.querySelector<HTMLButtonElement>('[aria-haspopup="menu"][aria-expanded="false"]')?.click();
  }, [ready]);

  return (
    <div className="flex h-full justify-end p-3">
      <div ref={rootRef} data-visual-target className="inline-flex">
        <ToolbarWithState threadId={threadId} threadName={threadName} />
      </div>
    </div>
  );
};
