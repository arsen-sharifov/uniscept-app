import type { TReferenceNode } from '@interfaces';
import { CanvasEdge, ReferenceNode } from '@/components';
import { createReferenceNode } from '../../utils';

export const SB_REF_ID = 'sb-ref-1';

export const NODE_TYPES = { 'reference-node': ReferenceNode };
export const EDGE_TYPES = { default: CanvasEdge };

export const defaultReference: TReferenceNode = createReferenceNode(
  SB_REF_ID,
  'Provenance keeps reasoning auditable over time.',
  'Governance model',
  'Research'
);

export const selectedReference: TReferenceNode = createReferenceNode(
  SB_REF_ID,
  'Selected reference card — cyan outline is active.',
  'Governance model',
  'Research',
  true
);

export const longPathReference: TReferenceNode = createReferenceNode(
  SB_REF_ID,
  'Voting thresholds should scale with the size of the canvas membership and respond to historical churn.',
  'Long deliberation thread on quorum, voting thresholds and qualified majorities',
  'Strategy & long-horizon planning workspace'
);
