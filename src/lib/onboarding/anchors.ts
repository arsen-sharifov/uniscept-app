'use client';

import type { IAnchorRect, IResolvedAnchor, ITourGeometry, TTourAnchor } from '@interfaces';
import {
  ANCHOR_SEPARATOR,
  TOUR_ANCHORS,
  TOUR_ANCHOR_SELECTORS,
  TOUR_OVERLAY_SELECTOR,
  TOUR_PANEL_ATTRIBUTE,
  TOUR_SURFACE_SELECTOR,
} from '@constants';

const ANCHOR_SET: ReadonlySet<string> = new Set(TOUR_ANCHORS);

const isTourAnchor = (value: string | undefined): value is TTourAnchor => value !== undefined && ANCHOR_SET.has(value);

const isVisible = (element: Element): boolean =>
  typeof element.checkVisibility !== 'function' ||
  element.checkVisibility({ opacityProperty: true, visibilityProperty: true });

const isRendered = (element: Element): boolean =>
  typeof element.checkVisibility !== 'function' || element.checkVisibility({ visibilityProperty: true });

const isTextEntry = (element: Element): boolean =>
  element instanceof HTMLInputElement ||
  element instanceof HTMLTextAreaElement ||
  (element instanceof HTMLElement && element.isContentEditable);

const toRect = (element: Element): IAnchorRect | null => {
  const { top, left, width, height } = element.getBoundingClientRect();
  if (width === 0 && height === 0) return null;

  return { top, left, width, height };
};

const isAppOverlay = (overlay: Element): boolean => overlay.querySelector(`[${TOUR_PANEL_ATTRIBUTE}]`) === null;

const readAppOverlays = (test: (element: Element) => boolean): Element[] =>
  [...document.querySelectorAll(TOUR_OVERLAY_SELECTOR)].filter(test).filter(isAppOverlay);

const overlayAround = (hit: Element, target: Element): Element | null => {
  const holding = hit.closest(TOUR_OVERLAY_SELECTOR);
  if (holding && !holding.contains(target)) return holding;

  return (
    [hit, hit.parentElement, hit.parentElement?.parentElement]
      .filter((node) => node instanceof Element)
      .map((node) => node.querySelector(TOUR_OVERLAY_SELECTOR))
      .find((overlay) => overlay !== null && !overlay.contains(target)) ?? null
  );
};

const findBlocker = (
  target: Element,
  { top, left, width, height }: IAnchorRect,
  expected: Element[],
): Element | null => {
  if (typeof document.elementsFromPoint !== 'function') return null;

  const stack = document.elementsFromPoint(left + width / 2, top + height / 2);
  const hit = stack.find((element) => element.closest(TOUR_SURFACE_SELECTOR) === null) ?? null;
  if (!hit || hit === target || target.contains(hit) || hit.contains(target)) return null;

  const overlay = overlayAround(hit, target);

  return overlay && !expected.some((element) => overlay.contains(element)) ? overlay : null;
};

export const dismissOverlays = (): void => {
  if (typeof document === 'undefined' || readAppOverlays(isRendered).length === 0) return;

  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
};

export const parseAnchors = (key: string): TTourAnchor[] => key.split(ANCHOR_SEPARATOR).filter(isTourAnchor);

export const findAnchorElement = (anchor: TTourAnchor): HTMLElement | null => {
  const element = document.querySelector<HTMLElement>(TOUR_ANCHOR_SELECTORS[anchor] ?? `[data-tour="${anchor}"]`);

  return element && isRendered(element) && toRect(element) !== null ? element : null;
};

const toResolved = (anchor: TTourAnchor): IResolvedAnchor | null => {
  const element = findAnchorElement(anchor);

  return element ? { anchor, element } : null;
};

export const readVisibleAnchors = (): ReadonlySet<TTourAnchor> => {
  const visible = new Set<TTourAnchor>();

  document.querySelectorAll<HTMLElement>('[data-tour]').forEach((element) => {
    if (isTourAnchor(element.dataset.tour) && isVisible(element)) visible.add(element.dataset.tour);
  });

  return visible;
};

export const readTourGeometry = (
  anchors: readonly TTourAnchor[],
  openAnchors: readonly TTourAnchor[],
): ITourGeometry => {
  const resolved = anchors.reduce<IResolvedAnchor | null>((found, candidate) => found ?? toResolved(candidate), null);
  const anchor = resolved?.anchor ?? null;
  const target = resolved?.element ?? null;
  const rect = target ? toRect(target) : null;
  const expected = openAnchors.map(findAnchorElement).filter((element) => element !== null);
  const blocker = target && rect ? findBlocker(target, rect, expected) : null;
  const blocked = blocker ? toRect(blocker) : null;

  if (blocked) return { rect, anchor, blocked, lit: [blocked], open: [blocked] };

  const focused = document.activeElement;
  const open = [
    rect,
    ...expected.map(toRect),
    ...readAppOverlays(isVisible).map(toRect),
    focused && isTextEntry(focused) ? toRect(focused) : null,
  ].filter((candidate) => candidate !== null);

  return { rect, anchor, blocked: null, lit: rect ? [rect] : [], open };
};

export const sameRect = (a: IAnchorRect | null, b: IAnchorRect | null): boolean => {
  if (a === null || b === null) return a === b;

  return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
};

export const sameRects = (a: readonly IAnchorRect[], b: readonly IAnchorRect[]): boolean =>
  a.length === b.length && a.every((rect, index) => sameRect(rect, b[index] ?? null));
