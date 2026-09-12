'use client';

import type { ICanvasExportContext, ICanvasExportNode, THandleId } from '@interfaces';

import { ARROW_MARKER_ATTRIBUTES, ARROW_PATH_D } from '../consts';
import { getCanvasEdgePath, getHandleAnchor, isHandleId } from '../utils';
import { EDGE_PATH_SELECTOR, EXPORT_EDGE_SELECTOR } from './consts';
import { defineOnce, svgElement } from './primitives';

const handleSide = (value: string | undefined, fallback: THandleId): THandleId =>
  isHandleId(value) ? value : fallback;

const renderArrowMarker = (stroke: string, context: ICanvasExportContext): string =>
  defineOnce(context, 'arrow', stroke, (id) => {
    const marker = svgElement('marker', { id, ...ARROW_MARKER_ATTRIBUTES });
    marker.append(svgElement('path', { d: ARROW_PATH_D, fill: stroke }));

    return marker;
  });

const renderExportEdge = (
  edge: SVGGElement,
  nodeById: Map<string, ICanvasExportNode>,
  context: ICanvasExportContext,
): SVGPathElement => {
  const sourceNode = nodeById.get(edge.dataset.source ?? '');
  const targetNode = nodeById.get(edge.dataset.target ?? '');
  const sourcePath = edge.querySelector<SVGPathElement>(EDGE_PATH_SELECTOR);
  if (!sourceNode || !targetNode || !sourcePath) throw new Error('A canvas edge is not ready');
  const sourceSide = handleSide(edge.dataset.sourceHandle, 'bottom');
  const targetSide = handleSide(edge.dataset.targetHandle, 'top');
  const source = getHandleAnchor(sourceNode, sourceSide);
  const target = getHandleAnchor(targetNode, targetSide);
  const bidirectional = edge.dataset.bidirectional === 'true';
  const { stroke, strokeWidth } = getComputedStyle(sourcePath);
  const marker = renderArrowMarker(stroke, context);
  const path = svgElement('path', {
    'data-edge-id': edge.dataset.exportEdge ?? '',
    'data-tone': edge.dataset.tone ?? 'default',
    d: getCanvasEdgePath({
      sourceX: source.x,
      sourceY: source.y,
      targetX: target.x,
      targetY: target.y,
      sourceSide,
      targetSide,
      bidirectional,
    }),
    fill: 'none',
    stroke,
    'stroke-width': strokeWidth,
    'marker-end': marker,
  });
  if (bidirectional) path.setAttribute('marker-start', marker);

  return path;
};

export const renderExportEdges = (
  root: HTMLElement,
  nodes: ICanvasExportNode[],
  context: ICanvasExportContext,
): SVGGElement => {
  const group = svgElement('g', { id: 'edges' });
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  group.append(
    ...Array.from(root.querySelectorAll<SVGGElement>(EXPORT_EDGE_SELECTOR), (edge) =>
      renderExportEdge(edge, nodeById, context),
    ),
  );

  return group;
};
