'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from '@/components';

const ThreadPage = () => {
  return (
    <div className="h-screen w-screen">
      <ReactFlowProvider>
        <Canvas />
      </ReactFlowProvider>
    </div>
  );
};

export default ThreadPage;
