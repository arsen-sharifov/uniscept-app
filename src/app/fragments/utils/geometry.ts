'use client';

import type { XYPosition } from '@xyflow/react';

import type { IHeroEdge, IHeroEdgePath, IRect, THandleId } from '@interfaces';

import { ARROW_LENGTH } from '@/components/Canvas/consts';
import { findNearestSides, getHandleAnchor } from '@/lib/canvas/utils';

import {
  HERO_EDGE_CONTROL_MAX_PX,
  HERO_EDGE_CONTROL_MIN_PX,
  HERO_EDGE_CONTROL_RATIO,
  HERO_SIDE_NORMALS,
} from '../consts';

const offsetAlong = (point: XYPosition, side: THandleId, amount: number): XYPosition => ({
  x: point.x + HERO_SIDE_NORMALS[side].x * amount,
  y: point.y + HERO_SIDE_NORMALS[side].y * amount,
});

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
  const end = offsetAlong(getHandleAnchor(target, targetHandle), targetHandle, ARROW_LENGTH);

  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const offset = Math.min(
    HERO_EDGE_CONTROL_MAX_PX,
    Math.max(HERO_EDGE_CONTROL_MIN_PX, distance * HERO_EDGE_CONTROL_RATIO),
  );
  const controlA = offsetAlong(start, sourceHandle, offset);
  const controlB = offsetAlong(end, targetHandle, offset);

  return {
    ...edge,
    d: `M ${start.x} ${start.y} C ${controlA.x} ${controlA.y}, ${controlB.x} ${controlB.y}, ${end.x} ${end.y}`,
  };
};
