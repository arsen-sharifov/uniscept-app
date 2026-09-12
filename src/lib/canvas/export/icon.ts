'use client';

import type { ICanvasExportContext } from '@interfaces';

import { SVG_PRESENTATION_ATTRIBUTES } from './consts';
import { relativeRect, setSvgAttributes } from './primitives';

const flattenPresentation = (element: Element, original: Element): void => {
  const style = getComputedStyle(original);
  element.removeAttribute('class');
  element.removeAttribute('style');
  SVG_PRESENTATION_ATTRIBUTES.forEach((attribute) =>
    element.setAttribute(attribute, style.getPropertyValue(attribute)),
  );
};

export const renderIcon = (source: SVGSVGElement, { origin }: ICanvasExportContext): SVGSVGElement => {
  const icon = source.cloneNode(true) as SVGSVGElement;
  const originals = [source, ...Array.from(source.querySelectorAll('*'))];
  [icon, ...Array.from(icon.querySelectorAll('*'))].forEach((element, index) => {
    const original = originals[index];
    if (original) flattenPresentation(element, original);
  });
  setSvgAttributes(icon, { ...relativeRect(source, origin) });

  return icon;
};
