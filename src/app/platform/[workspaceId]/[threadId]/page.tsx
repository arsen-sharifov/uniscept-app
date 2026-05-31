'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { useParams } from 'next/navigation';

import { useEditorPreferences } from '@hooks';
import { Canvas } from '@/components';
import { toParam } from '@/lib/utils';

const ThreadPage = () => {
  const params = useParams();
  const { snapToGrid, smartGuides, defaultZoom } = useEditorPreferences();
  const workspaceId = toParam(params.workspaceId);
  const threadId = toParam(params.threadId);

  if (!workspaceId || !threadId) return null;

  return (
    <div className="h-screen w-screen">
      <ReactFlowProvider>
        <Canvas
          workspaceId={workspaceId}
          threadId={threadId}
          snapToGrid={snapToGrid}
          smartGuides={smartGuides}
          defaultZoom={defaultZoom}
        />
      </ReactFlowProvider>
    </div>
  );
};

export default ThreadPage;
