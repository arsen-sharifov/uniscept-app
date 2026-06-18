import type { Edge, Node } from '@xyflow/react';

import { ECanvasNodeType } from '@interfaces';

import { isCanvasNodeData } from './status';

export type TValidationAction = 'valid' | 'answer';

export const hasValidatedParent = (nodeId: string, nodes: Node[], edges: Edge[]): boolean => {
  const parentIds = edges.filter((edge) => edge.target === nodeId).map((edge) => edge.source);
  if (parentIds.length === 0) return false;

  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  return parentIds.some((parentId) => {
    const parent = nodeById.get(parentId);
    if (!parent) return false;
    if (parent.type === ECanvasNodeType.Question) return true;

    return parent.type === ECanvasNodeType.Canvas && isCanvasNodeData(parent.data) && parent.data.status === 'valid';
  });
};

export const computeEligibleIds = (nodes: Node[], edges: Edge[], action: TValidationAction): Set<string> => {
  const eligible = new Set<string>();

  nodes.forEach((node) => {
    if (node.type !== ECanvasNodeType.Canvas || !isCanvasNodeData(node.data)) return;
    if (action === 'valid' && node.data.status === 'valid') return;
    if (action === 'answer' && node.data.isAnswer) return;
    if (!hasValidatedParent(node.id, nodes, edges)) return;

    eligible.add(node.id);
  });

  return eligible;
};
