'use client';

import type { ICanvasExportContext, IExportCssListScan, IRect } from '@interfaces';

import { RGB_COLOR_PATTERN, SRGB_COLOR_PATTERN, SVG_NAMESPACE } from './consts';

export const setSvgAttributes = (element: Element, attributes: Record<string, string | number>): void =>
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));

export const svgElement = <T extends keyof SVGElementTagNameMap>(
  name: T,
  attributes: Record<string, string | number> = {},
): SVGElementTagNameMap[T] => {
  const element = document.createElementNS(SVG_NAMESPACE, name);
  setSvgAttributes(element, attributes);

  return element;
};

export const relativeRect = (element: Element, origin: IRect): IRect => {
  const rect = element.getBoundingClientRect();

  return { x: rect.x - origin.x, y: rect.y - origin.y, width: rect.width, height: rect.height };
};

export const splitCssList = (value: string): string[] => {
  const scan = Array.from(value).reduce<IExportCssListScan>(
    (state, character) => {
      if (character === ',' && state.depth === 0)
        return { ...state, parts: [...state.parts, state.current], current: '' };
      const depth = state.depth + Number(character === '(') - Number(character === ')');

      return { ...state, depth, current: state.current + character };
    },
    { parts: [], current: '', depth: 0 },
  );

  return [...scan.parts, scan.current].map((part) => part.trim()).filter(Boolean);
};

export const parseCssColor = (value: string): string | undefined => {
  if (RGB_COLOR_PATTERN.test(value)) return value;
  const [, red, green, blue, alpha = '1'] = value.match(SRGB_COLOR_PATTERN) ?? [];
  if (!red || !green || !blue) return;
  const channels = [red, green, blue].map((channel) => Math.round(Number(channel) * 255));

  return `rgba(${channels.join(', ')}, ${Number(alpha)})`;
};

const sampleColor = (scratch: CanvasRenderingContext2D, color: string): string => {
  scratch.fillStyle = color;
  scratch.clearRect(0, 0, 1, 1);
  scratch.fillRect(0, 0, 1, 1);
  const [red, green, blue, alpha = 255] = scratch.getImageData(0, 0, 1, 1).data;

  return `rgba(${red}, ${green}, ${blue}, ${alpha / 255})`;
};

export const resolveExportColor = ({ stage, scratch, colors }: ICanvasExportContext, color: string): string => {
  const cached = colors.get(color);
  if (cached) return cached;
  const probe = document.createElement('span');
  probe.style.color = color;
  stage.append(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();
  const resolved = parseCssColor(computed) ?? sampleColor(scratch, computed);
  colors.set(color, resolved);

  return resolved;
};

export const defineOnce = (
  { defs, definitions }: ICanvasExportContext,
  prefix: string,
  key: string,
  build: (id: string) => SVGElement,
): string => {
  const cacheKey = `${prefix}:${key}`;
  const cached = definitions.get(cacheKey);
  if (cached) return cached;
  const id = `${prefix}-${definitions.size}`;
  defs.append(build(id));
  const reference = `url(#${id})`;
  definitions.set(cacheKey, reference);

  return reference;
};
