'use client';

import { useParams } from 'next/navigation';
import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from '@/components';
import { toParam } from '@/lib/utils';

const ThreadPage = () => {
  const params = useParams();
  const workspaceId = toParam(params.workspaceId);
  const threadId = toParam(params.threadId);

  if (!workspaceId || !threadId) return null;

  return (
    <div className="h-screen w-screen">
      <ReactFlowProvider>
        <Canvas workspaceId={workspaceId} threadId={threadId} />
      </ReactFlowProvider>
    </div>
  );
};

export default ThreadPage;
