import { ReactFlow } from '@xyflow/react';
import type { TCanvasNode } from '@interfaces';
import { FIT_VIEW_OPTIONS, LOCKED_GESTURES, PRO_OPTIONS } from '../../../consts';
import { EDGE_TYPES, NODE_TYPES } from '../consts';

interface ISingleNodeFlowProps {
  node: TCanvasNode;
}

export const SingleNodeFlow = ({ node }: ISingleNodeFlowProps) => (
  <ReactFlow
    nodes={[node]}
    edges={[]}
    nodeTypes={NODE_TYPES}
    edgeTypes={EDGE_TYPES}
    fitView
    fitViewOptions={FIT_VIEW_OPTIONS}
    {...LOCKED_GESTURES}
    proOptions={PRO_OPTIONS}
  />
);
