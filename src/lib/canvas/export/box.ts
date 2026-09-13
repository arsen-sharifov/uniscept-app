'use client';

import type { ICanvasExportContext, IRect } from '@interfaces';

import { LINEAR_GRADIENT_PREFIX } from './consts';
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

export const parseWashColor = (backgroundImage: string): string | undefined => {
  if (!backgroundImage.startsWith(LINEAR_GRADIENT_PREFIX) || !backgroundImage.endsWith(')')) return;

  const [first, second, ...rest] = splitCssList(backgroundImage.slice(LINEAR_GRADIENT_PREFIX.length, -1));

  return first && first === second && rest.length === 0 ? first : undefined;
};

const renderBox = (
  rect: IRect,
  radius: number,
  style: CSSStyleDeclaration,
  context: ICanvasExportContext,
): SVGRectElement => {
  const border = Number.parseFloat(style.borderTopWidth) || 0;
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

const renderWash = (box: SVGRectElement, color: string, context: ICanvasExportContext): SVGRectElement => {
  const wash = box.cloneNode() as SVGRectElement;
  ['stroke', 'stroke-width', 'filter'].forEach((attribute) => wash.removeAttribute(attribute));
  wash.setAttribute('fill', resolveExportColor(context, color));

  return wash;
};

const renderSurface = (
  rect: IRect,
  radius: number,
  style: CSSStyleDeclaration,
  context: ICanvasExportContext,
): SVGRectElement[] => {
  const box = renderBox(rect, radius, style, context);
  const wash = parseWashColor(style.backgroundImage);

  return wash ? [box, renderWash(box, wash, context)] : [box];
};

const renderClip = (rect: IRect, radius: number, context: ICanvasExportContext): string =>
  defineOnce(context, 'clip', [rect.x, rect.y, rect.width, rect.height, radius].join(','), (id) => {
    const clip = svgElement('clipPath', { id });
    clip.append(svgElement('rect', { ...rect, rx: radius }));

    return clip;
  });

const renderChild = (child: ChildNode, style: CSSStyleDeclaration, context: ICanvasExportContext): SVGElement[] => {
  switch (true) {
    case child instanceof Text:
      return renderExportText(child, style, context);
    case child instanceof SVGSVGElement:
      return [renderIcon(child, context)];
    case child instanceof HTMLElement:
      return [renderExportElement(child, context)];
    default:
      return [];
  }
};

const renderContent = (
  element: HTMLElement,
  rect: IRect,
  radius: number,
  style: CSSStyleDeclaration,
  context: ICanvasExportContext,
): SVGGElement => {
  const content = svgElement('g');

  if (style.overflow === 'hidden' && radius > 0) content.setAttribute('clip-path', renderClip(rect, radius, context));
  content.append(...Array.from(element.childNodes).flatMap((child) => renderChild(child, style, context)));

  return content;
};

export const renderExportElement = (element: HTMLElement, context: ICanvasExportContext): SVGGElement => {
  const group = svgElement('g');
  const style = getComputedStyle(element);
  if (isHidden(style)) return group;

  const rect = relativeRect(element, context.origin);
  const radius = Number.parseFloat(style.borderTopLeftRadius) || 0;

  group.append(...renderSurface(rect, radius, style, context), renderContent(element, rect, radius, style, context));
  if (style.opacity !== '1') group.setAttribute('opacity', style.opacity);

  return group;
};
