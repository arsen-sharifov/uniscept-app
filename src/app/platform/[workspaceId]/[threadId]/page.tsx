'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from '@/components';
import { useCanvasStore } from '@/lib/stores';
import { getCurrentUserId } from '@/lib/supabase';

const ThreadPage = () => {
  const params = useParams();
  const threadId = params?.threadId as string;
  const loadCanvas = useCanvasStore((s) => s.loadCanvas);

  useEffect(() => {
    if (!threadId) return;

    const load = async () => {
      const userId = await getCurrentUserId();
      if (userId) {
        await loadCanvas(threadId, userId);
      }
    };
    load();
  }, [threadId, loadCanvas]);

  return (
    <div className="h-screen w-screen">
      <ReactFlowProvider>
        <Canvas />
      </ReactFlowProvider>
    </div>
  );
};

export default ThreadPage;
