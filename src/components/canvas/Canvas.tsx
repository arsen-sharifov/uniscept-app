'use client';

import { Background, BackgroundVariant, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export const Canvas = () => {
  return (
    <ReactFlow proOptions={{ hideAttribution: true }}>
      <Background variant={BackgroundVariant.Dots} />
    </ReactFlow>
  );
};
