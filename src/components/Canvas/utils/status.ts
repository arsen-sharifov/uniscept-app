import type { Edge, Node } from '@xyflow/react';
import {
  ECanvasNodeType,
  type ICanvasNodeData,
  type IReferenceNodeData,
  type TEdgeTone,
  type TEffectiveStatus,
} from '@interfaces';

export const isCanvasNodeData = (data: Record<string, unknown>): data is ICanvasNodeData =>
  typeof data.label === 'string' &&
  (data.status === null || data.status === 'valid' || data.status === 'invalid') &&
  Array.isArray(data.comments);

export const isReferenceNodeData = (data: Record<string, unknown>): data is IReferenceNodeData =>
  typeof data.label === 'string' &&
  typeof data.sourceNodeId === 'string' &&
  typeof data.sourceNodeLabel === 'string' &&
  typeof data.sourceThreadId === 'string' &&
  typeof data.sourceThreadName === 'string' &&
  typeof data.sourceWorkspaceId === 'string' &&
  typeof data.sourceWorkspaceName === 'string';

export const collectStatusTargetIds = (nodes: Node[], clickedId: string): string[] => {
  const selectedIds = nodes
    .filter((node) => node.selected && node.type === ECanvasNodeType.Canvas)
    .map((node) => node.id);

  if (selectedIds.length > 1 && selectedIds.includes(clickedId)) {
    return selectedIds;
  }

  return [clickedId];
};

const isMarkedValid = (status: TEffectiveStatus | undefined): boolean =>
  status === 'valid' || status === 'tainted' || status === 'tainted-valid';

export const resolveEdgeTone = (
  sourceStatus: TEffectiveStatus | undefined,
  targetStatus: TEffectiveStatus | undefined
): TEdgeTone => {
  if (sourceStatus === 'invalid') {
    if (targetStatus === 'valid' || targetStatus === 'tainted-valid') return 'tainted';
    return 'invalid';
  }
  if (sourceStatus === 'tainted' || sourceStatus === 'tainted-valid') return 'tainted';
  if (sourceStatus === 'valid' && targetStatus === 'invalid') return 'invalid';
  if (sourceStatus === 'valid' && isMarkedValid(targetStatus)) return 'valid';

  return 'default';
};

const TONE_SEVERITY: Record<TEdgeTone, number> = {
  invalid: 3,
  tainted: 2,
  valid: 1,
  default: 0,
};

export const resolveBidirectionalEdgeTone = (
  statusA: TEffectiveStatus | undefined,
  statusB: TEffectiveStatus | undefined
): TEdgeTone => {
  const ab = resolveEdgeTone(statusA, statusB);
  const ba = resolveEdgeTone(statusB, statusA);
  return TONE_SEVERITY[ab] >= TONE_SEVERITY[ba] ? ab : ba;
};

export const computeEffectiveStatuses = (nodes: Node[], edges: Edge[]): Map<string, TEffectiveStatus> => {
  const result = new Map<string, TEffectiveStatus>();

  nodes.forEach((node) => {
    if (node.type !== ECanvasNodeType.Canvas) return;
    if (!isCanvasNodeData(node.data)) return;
    result.set(node.id, node.data.status);
  });

  const adjacency = new Map<string, string[]>();
  edges.forEach((edge) => {
    const list = adjacency.get(edge.source) ?? [];
    list.push(edge.target);
    adjacency.set(edge.source, list);
  });

  const queue: string[] = [];
  const visited = new Set<string>();

  result.forEach((status, id) => {
    if (status === 'invalid') {
      queue.push(id);
      visited.add(id);
    }
  });

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    const targets = adjacency.get(current) ?? [];
    targets.forEach((target) => {
      if (visited.has(target)) return;
      visited.add(target);

      const targetStatus = result.get(target);
      if (targetStatus === 'invalid') return;

      result.set(target, targetStatus === 'valid' ? 'tainted-valid' : 'tainted');
      queue.push(target);
    });
  }

  return result;
};
