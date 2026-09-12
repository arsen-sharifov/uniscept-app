'use client';

import type { ICanvasExportContext, IExportShadowLayer } from '@interfaces';

import { BOX_SHADOW_LAYER_PATTERN, SHADOW_FILTER_REGION } from './consts';
import { defineOnce, splitCssList, svgElement } from './primitives';

export const parseBoxShadowLayers = (boxShadow: string): IExportShadowLayer[] =>
  splitCssList(boxShadow)
    .filter((layer) => !layer.includes('inset'))
    .flatMap((layer) => {
      const [, color, dx, dy, blur, spread] = layer.match(BOX_SHADOW_LAYER_PATTERN) ?? [];
      if (!color) return [];

      return [{ color, dx: Number(dx), dy: Number(dy), blur: Number(blur), spread: Number(spread) }];
    });

const appendShadowLayer = (filter: SVGFilterElement, layer: IExportShadowLayer, index: number): string => {
  const result = `shadow-${index}`;
  filter.append(
    svgElement('feMorphology', {
      in: 'SourceAlpha',
      operator: layer.spread < 0 ? 'erode' : 'dilate',
      radius: Math.abs(layer.spread),
      result: `spread-${index}`,
    }),
    svgElement('feGaussianBlur', { in: `spread-${index}`, stdDeviation: layer.blur / 2, result: `blur-${index}` }),
    svgElement('feOffset', { in: `blur-${index}`, dx: layer.dx, dy: layer.dy, result: `offset-${index}` }),
    svgElement('feFlood', { 'flood-color': layer.color, result: `color-${index}` }),
    svgElement('feComposite', { in: `color-${index}`, in2: `offset-${index}`, operator: 'in', result }),
  );

  return result;
};

const createShadowFilter = (id: string, layers: IExportShadowLayer[]): SVGFilterElement => {
  const filter = svgElement('filter', { id, ...SHADOW_FILTER_REGION, 'color-interpolation-filters': 'sRGB' });
  const merge = svgElement('feMerge');
  layers
    .toReversed()
    .forEach((layer, index) =>
      merge.append(svgElement('feMergeNode', { in: appendShadowLayer(filter, layer, index) })),
    );
  merge.append(svgElement('feMergeNode', { in: 'SourceGraphic' }));
  filter.append(merge);

  return filter;
};

export const renderShadow = (boxShadow: string, context: ICanvasExportContext): string | undefined => {
  const layers = parseBoxShadowLayers(boxShadow);
  if (layers.length === 0) return;

  return defineOnce(context, 'shadow', boxShadow, (id) => createShadowFilter(id, layers));
};
