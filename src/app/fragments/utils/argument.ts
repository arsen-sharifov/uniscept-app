import type { Edge } from '@xyflow/react';

import {
  ECanvasNodeType,
  type IHeroClaim,
  type IHeroEdge,
  type TCanvasNode,
  type TEdgeTone,
  type TEffectiveStatus,
  type THeroTone,
} from '@interfaces';

import { computeEffectiveStatuses, isAffected, resolveEdgeTone } from '@/components/Canvas/utils';

const toCanvasNode = (claim: IHeroClaim, refutedIds: ReadonlySet<string>): TCanvasNode => ({
  id: claim.id,
  type: claim.kind === 'question' ? ECanvasNodeType.Question : ECanvasNodeType.Canvas,
  position: { x: 0, y: 0 },
  data: {
    label: claim.code,
    status: refutedIds.has(claim.id) ? 'invalid' : claim.status,
    isAnswer: claim.isAnswer === true && !refutedIds.has(claim.id),
    comments: [],
  },
});

export const resolveClaimTone = (claim: IHeroClaim, status: TEffectiveStatus | undefined): THeroTone => {
  if (claim.kind === 'question') return 'question';
  if (status === 'invalid') return 'refuted';
  if (isAffected(status)) return 'affected';
  if (claim.isAnswer) return 'answer';

  return 'valid';
};

export const computeClaimStatuses = (
  claims: IHeroClaim[],
  edges: IHeroEdge[],
  refutedIds: ReadonlySet<string>,
): Map<string, TEffectiveStatus> =>
  computeEffectiveStatuses(
    claims.map((claim) => toCanvasNode(claim, refutedIds)),
    edges.map<Edge>((edge) => ({ id: edge.id, source: edge.source, target: edge.target })),
  );

export const computeEdgeTones = (edges: IHeroEdge[], statuses: Map<string, TEffectiveStatus>): Map<string, TEdgeTone> =>
  new Map(edges.map((edge) => [edge.id, resolveEdgeTone(statuses.get(edge.source), statuses.get(edge.target))]));

const walkDepths = (
  frontier: string[],
  depth: number,
  adjacency: Map<string, string[]>,
  acc: Map<string, number>,
): Map<string, number> => {
  const next = [...new Set(frontier.flatMap((id) => adjacency.get(id) ?? []).filter((target) => !acc.has(target)))];
  if (next.length === 0) return acc;

  next.forEach((target) => acc.set(target, depth));

  return walkDepths(next, depth + 1, adjacency, acc);
};

export const collectCascadeDepths = (edges: IHeroEdge[], refutedIds: ReadonlySet<string>): Map<string, number> => {
  const adjacency = edges.reduce((map, edge) => {
    map.set(edge.source, [...(map.get(edge.source) ?? []), edge.target]);

    return map;
  }, new Map<string, string[]>());

  const roots = [...refutedIds];
  const seeded = new Map(roots.map((id) => [id, 0]));

  return walkDepths(roots, 1, adjacency, seeded);
};
