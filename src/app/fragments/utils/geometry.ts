'use client';

import type { XYPosition } from '@xyflow/react';

import type { IHeroEdge, IHeroEdgePath, IRect } from '@interfaces';

import { ARROW_LENGTH } from '@/lib/canvas/consts';
import { findNearestSides, getHandleAnchor, offsetAlongSide } from '@/lib/canvas/utils';

import { HERO_EDGE_CONTROL_MAX_PX, HERO_EDGE_CONTROL_MIN_PX, HERO_EDGE_CONTROL_RATIO } from '../consts';

const translationInPixels = (value: string, size: number): number =>
  (Number.parseFloat(value) || 0) * (value.endsWith('%') ? size / 100 : 1);

const layoutOffset = (element: HTMLElement, stage: HTMLElement): XYPosition => {
  const [translateX = '0', translateY = '0'] = getComputedStyle(element).translate.split(/\s+/);
  const own = {
    x: element.offsetLeft + translationInPixels(translateX, element.offsetWidth),
    y: element.offsetTop + translationInPixels(translateY, element.offsetHeight),
  };
  const parent = element.offsetParent;
  if (!(parent instanceof HTMLElement) || parent === stage) return own;

  const above = layoutOffset(parent, stage);

  return { x: own.x + above.x, y: own.y + above.y };
};

export const measureLayoutRect = (element: HTMLElement, stage: HTMLElement): IRect | null => {
  if (element.offsetWidth === 0) return null;

  return { ...layoutOffset(element, stage), width: element.offsetWidth, height: element.offsetHeight };
};

export const buildEdgePath = (edge: IHeroEdge, source: IRect, target: IRect): IHeroEdgePath => {
  const { sourceHandle, targetHandle } = findNearestSides(source, target);
  const start = getHandleAnchor(source, sourceHandle);
  const end = offsetAlongSide(getHandleAnchor(target, targetHandle), targetHandle, ARROW_LENGTH);

  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const offset = Math.min(
    HERO_EDGE_CONTROL_MAX_PX,
    Math.max(HERO_EDGE_CONTROL_MIN_PX, distance * HERO_EDGE_CONTROL_RATIO),
  );
  const controlA = offsetAlongSide(start, sourceHandle, offset);
  const controlB = offsetAlongSide(end, targetHandle, offset);

  return {
    ...edge,
    d: `M ${start.x} ${start.y} C ${controlA.x} ${controlA.y}, ${controlB.x} ${controlB.y}, ${end.x} ${end.y}`,
  };
};
