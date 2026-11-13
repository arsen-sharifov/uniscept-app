import type { Locator, Page } from '@playwright/test';

import type { IScreenPoint } from '@interfaces';

import { NODE_SELECTOR, OVERLAY_PROBE_INSET_PX, TOUR_CARD_SELECTOR, VIEWPORT_SELECTOR } from '../consts';
import { getPane } from './canvas';

export const canScrollSideways = (scroller: Locator): Promise<boolean> =>
  scroller.evaluate((element) => element.scrollWidth > element.clientWidth);

export const readClippedTexts = (containers: Locator): Promise<string[]> =>
  containers.evaluateAll((roots) => {
    const findClipper = (element: Element | null): Element | null => {
      if (!element) return null;

      const { overflowX } = getComputedStyle(element);
      if (overflowX === 'hidden' || overflowX === 'clip') return element;

      return overflowX === 'visible' ? findClipper(element.parentElement) : null;
    };
    const isClipped = (text: Text) => {
      const clipper = findClipper(text.parentElement);
      if (!clipper) return false;

      const range = document.createRange();
      range.selectNodeContents(text);
      const textBox = range.getBoundingClientRect();
      const clipBox = clipper.getBoundingClientRect();

      return textBox.width > 0 && (textBox.left < clipBox.left - 1 || textBox.right > clipBox.right + 1);
    };

    return roots
      .flatMap((root) => [root, ...root.querySelectorAll('*')])
      .flatMap((element) => [...element.childNodes])
      .filter((node): node is Text => node instanceof Text && node.textContent.trim() !== '' && isClipped(node))
      .map((text) => text.textContent.trim());
  });

export const countNodesUnderTourCard = (page: Page): Promise<number> =>
  page.evaluate(
    ({ cardSelector, nodeSelector }) => {
      const card = document.querySelector(cardSelector)?.getBoundingClientRect();
      if (!card) return 0;

      return [...document.querySelectorAll(nodeSelector)]
        .map((node) => node.getBoundingClientRect())
        .filter(
          (node) =>
            node.left < card.right && node.right > card.left && node.top < card.bottom && node.bottom > card.top,
        ).length;
    },
    { cardSelector: TOUR_CARD_SELECTOR, nodeSelector: NODE_SELECTOR },
  );

export const measureCanvasWidth = (page: Page): Promise<number> => getPane(page).evaluate((pane) => pane.clientWidth);

export const measureOffsetFromCanvasCenter = async (page: Page, target: Locator): Promise<IScreenPoint> => {
  const [pane, box] = await Promise.all([getPane(page).boundingBox(), target.boundingBox()]);

  if (!pane || !box) throw new Error('The canvas or its node is not laid out');

  return {
    x: box.x + box.width / 2 - (pane.x + pane.width / 2),
    y: box.y + box.height / 2 - (pane.y + pane.height / 2),
  };
};

export const measureDistance = (from: IScreenPoint, to: IScreenPoint): number =>
  Math.hypot(to.x - from.x, to.y - from.y);

export const readCanvasZoom = (page: Page): Promise<number> =>
  page.locator(VIEWPORT_SELECTOR).evaluate((viewport) => new DOMMatrixReadOnly(getComputedStyle(viewport).transform).a);

export const countCoveredPoints = (overlay: Locator): Promise<number> =>
  overlay.evaluate((element, inset) => {
    const box = element.getBoundingClientRect();
    const columns = [box.left + inset, box.left + box.width / 2, box.right - inset];
    const rows = [box.top + inset, box.top + box.height / 2, box.bottom - inset];

    return columns
      .flatMap((x) => rows.map((y) => document.elementFromPoint(x, y)))
      .filter((hit) => !hit || !element.contains(hit)).length;
  }, OVERLAY_PROBE_INSET_PX);
