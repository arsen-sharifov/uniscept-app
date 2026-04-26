'use client';

import { useParams } from 'next/navigation';
import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from '@/components';

const ThreadPage = () => {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const threadId = params.threadId as string;

  return (
    <div className="h-screen w-screen">
      <ReactFlowProvider>
        <Canvas workspaceId={workspaceId} threadId={threadId} />
      </ReactFlowProvider>
    </div>
  );
};

export default ThreadPage;
