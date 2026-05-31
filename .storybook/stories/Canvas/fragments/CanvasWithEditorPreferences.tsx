import { useEffect } from 'react';

import { Canvas } from '@/components';

interface ICanvasWithEditorPreferencesProps {
  workspaceId: string;
  threadId: string;
  snapToGrid: boolean;
  smartGuides: boolean;
}

export const CanvasWithEditorPreferences = ({
  workspaceId,
  threadId,
  snapToGrid,
  smartGuides,
}: ICanvasWithEditorPreferencesProps) => {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-snap-to-grid', String(snapToGrid));
    root.setAttribute('data-smart-guides', String(smartGuides));

    return () => {
      root.removeAttribute('data-snap-to-grid');
      root.removeAttribute('data-smart-guides');
    };
  }, [snapToGrid, smartGuides]);

  return <Canvas workspaceId={workspaceId} threadId={threadId} />;
};
