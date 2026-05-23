import { ReactFlow } from '@xyflow/react';

import type { TReferenceNode } from '@interfaces';

import { FIT_VIEW_OPTIONS, LOCKED_GESTURES, PRO_OPTIONS } from '../../../consts';
import { EDGE_TYPES, NODE_TYPES } from '../consts';

interface ISingleReferenceFlowProps {
  node: TReferenceNode;
}

export const SingleReferenceFlow = ({ node }: ISingleReferenceFlowProps) => (
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
