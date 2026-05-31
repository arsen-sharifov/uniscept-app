import type { Node } from '@xyflow/react';

import type { IAlignmentGuide } from '@interfaces';

import { ALIGN_GUIDE_THRESHOLD_PX } from '../consts';

interface ISpan {
  start: number;
  end: number;
}

const sampleLines = (origin: number, size: number): readonly number[] => [origin, origin + size / 2, origin + size];

const mergeSpan = (existing: ISpan | undefined, start: number, end: number): ISpan => ({
  start: existing ? Math.min(existing.start, start) : start,
  end: existing ? Math.max(existing.end, end) : end,
});

const collectGuides = (positions: Map<number, ISpan>, direction: IAlignmentGuide['direction']): IAlignmentGuide[] =>
  Array.from(positions.entries()).map(([position, span]) => ({
    direction,
    position,
    start: span.start,
    end: span.end,
  }));

export const computeAlignmentGuides = (
  draggedId: string,
  draggedX: number,
  draggedY: number,
  draggedW: number,
  draggedH: number,
  nodes: readonly Node[],
  threshold: number = ALIGN_GUIDE_THRESHOLD_PX,
): IAlignmentGuide[] => {
  if (!draggedW || !draggedH) {
    return [];
  }

  const verticals = new Map<number, ISpan>();
  const horizontals = new Map<number, ISpan>();

  const draggedVerticalLines = sampleLines(draggedX, draggedW);
  const draggedHorizontalLines = sampleLines(draggedY, draggedH);

  nodes.forEach((node) => {
    if (node.id === draggedId) {
      return;
    }

    const width = node.measured?.width ?? 0;
    const height = node.measured?.height ?? 0;
    if (!width || !height) {
      return;
    }

    const nodeVerticalLines = sampleLines(node.position.x, width);
    const nodeHorizontalLines = sampleLines(node.position.y, height);

    draggedVerticalLines.forEach((draggedLine) =>
      nodeVerticalLines.forEach((nodeLine) => {
        if (Math.abs(draggedLine - nodeLine) < threshold) {
          const start = Math.min(draggedY, node.position.y);
          const end = Math.max(draggedY + draggedH, node.position.y + height);
          verticals.set(nodeLine, mergeSpan(verticals.get(nodeLine), start, end));
        }
      }),
    );

    draggedHorizontalLines.forEach((draggedLine) =>
      nodeHorizontalLines.forEach((nodeLine) => {
        if (Math.abs(draggedLine - nodeLine) < threshold) {
          const start = Math.min(draggedX, node.position.x);
          const end = Math.max(draggedX + draggedW, node.position.x + width);
          horizontals.set(nodeLine, mergeSpan(horizontals.get(nodeLine), start, end));
        }
      }),
    );
  });

  return [...collectGuides(verticals, 'vertical'), ...collectGuides(horizontals, 'horizontal')];
};
