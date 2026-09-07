'use client';

import { useReactFlow } from '@xyflow/react';

import type { INodeReference } from '@interfaces';

import { useCanvasStore } from '@/lib/stores';

import { ReferenceSearchPanelContent } from './fragments';

interface IReferenceSearchPanelProps {
  nodes?: INodeReference[];
  loading?: boolean;
}

export const ReferenceSearchPanel = ({ nodes = [], loading = false }: IReferenceSearchPanelProps) => {
  const { flowToScreenPosition } = useReactFlow();

  const referenceSearchPosition = useCanvasStore((s) => s.referenceSearchPosition);
  const addReferenceNode = useCanvasStore((s) => s.addReferenceNode);
  const setReferenceSearchPosition = useCanvasStore((s) => s.setReferenceSearchPosition);

  if (!referenceSearchPosition) {
    return null;
  }

  return (
    <ReferenceSearchPanelContent
      key={`${referenceSearchPosition.x},${referenceSearchPosition.y}`}
      nodes={nodes}
      loading={loading}
      position={referenceSearchPosition}
      screenPos={flowToScreenPosition(referenceSearchPosition)}
      onSelect={addReferenceNode}
      onClose={() => setReferenceSearchPosition(null)}
    />
  );
};
