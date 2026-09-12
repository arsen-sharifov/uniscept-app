'use client';

import type { ICanvasExportContext, IRect } from '@interfaces';

import { FLAT_GRADIENT_PATTERN } from './consts';
import { renderShadow } from './filters';
import { renderIcon } from './icon';
import { defineOnce, relativeRect, resolveExportColor, setSvgAttributes, splitCssList, svgElement } from './primitives';
import { renderExportText } from './text';

const isHidden = (style: CSSStyleDeclaration): boolean =>
  style.display === 'none' || style.opacity === '0' || style.visibility === 'hidden';

const insetRect = ({ x, y, width, height }: IRect, inset: number): IRect => ({
  x: x + inset,
  y: y + inset,
  width: Math.max(0, width - inset * 2),
  height: Math.max(0, height - inset * 2),
});

const renderBox = (
  rect: IRect,
  radius: number,
  style: CSSStyleDeclaration,
  context: ICanvasExportContext,
): SVGRectElement => {
  const border = parseFloat(style.borderTopWidth) || 0;
  const box = svgElement('rect', {
    ...insetRect(rect, border / 2),
    rx: Math.max(0, radius - border / 2),
    fill: style.backgroundColor,
  });
  if (border > 0) setSvgAttributes(box, { stroke: style.borderTopColor, 'stroke-width': border });
  const shadow = renderShadow(style.boxShadow, context);
  if (shadow) box.setAttribute('filter', shadow);

  return box;
};

export const parseWashColor = (backgroundImage: string): string | undefined => {
  const [, stops = ''] = backgroundImage.match(FLAT_GRADIENT_PATTERN) ?? [];
  const [first, second, ...rest] = splitCssList(stops);

  return first && first === second && rest.length === 0 ? first : undefined;
};

const renderWash = (box: SVGRectElement, color: string, context: ICanvasExportContext): SVGRectElement => {
  const wash = box.cloneNode() as SVGRectElement;
  ['stroke', 'stroke-width', 'filter'].forEach((attribute) => wash.removeAttribute(attribute));
  wash.setAttribute('fill', resolveExportColor(context, color));

  return wash;
};

const renderClip = (rect: IRect, radius: number, context: ICanvasExportContext): string =>
  defineOnce(context, 'clip', [rect.x, rect.y, rect.width, rect.height, radius].join(','), (id) => {
    const clip = svgElement('clipPath', { id });
    clip.append(svgElement('rect', { ...rect, rx: radius }));

    return clip;
  });

const renderChildren = (
  element: HTMLElement,
  style: CSSStyleDeclaration,
  context: ICanvasExportContext,
): SVGElement[] =>
  Array.from(element.childNodes).flatMap((child) => {
    if (child instanceof Text) return renderExportText(child, style, context);
    if (child instanceof SVGSVGElement) return [renderIcon(child, context)];
    if (child instanceof HTMLElement) return [renderExportElement(child, context)];

    return [];
  });

export const renderExportElement = (element: HTMLElement, context: ICanvasExportContext): SVGGElement => {
  const group = svgElement('g');
  const style = getComputedStyle(element);
  if (isHidden(style)) return group;
  const rect = relativeRect(element, context.origin);
  const radius = parseFloat(style.borderTopLeftRadius) || 0;
  const box = renderBox(rect, radius, style, context);
  const wash = parseWashColor(style.backgroundImage);
  const content = svgElement('g');
  if (style.overflow === 'hidden' && radius > 0) content.setAttribute('clip-path', renderClip(rect, radius, context));
  content.append(...renderChildren(element, style, context));
  group.append(box, ...(wash ? [renderWash(box, wash, context)] : []), content);
  if (style.opacity !== '1') group.setAttribute('opacity', style.opacity);

  return group;
};
