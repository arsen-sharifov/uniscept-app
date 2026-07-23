import type { Page } from '@playwright/test';

import type { IVisualClip, IVisualRegionCapture } from '../interfaces';

export const getRegionClip = async (
  page: Page,
  { includeDescendants = false, padding, selectors }: IVisualRegionCapture,
): Promise<IVisualClip> =>
  page.evaluate(
    ({ descendantsIncluded, requestedPadding, requestedSelectors }) => {
      const visibleRects: DOMRect[] = [];
      const missingSelectors: string[] = [];

      const getVisibleRect = (element: HTMLElement) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          Number.parseFloat(style.opacity || '1') > 0 &&
          rect.width > 0 &&
          rect.height > 0
          ? rect
          : null;
      };

      requestedSelectors.forEach((selector) => {
        const selectorRects = Array.from(document.querySelectorAll<HTMLElement>(selector))
          .flatMap((element) =>
            descendantsIncluded ? [element, ...element.querySelectorAll<HTMLElement>('*')] : [element],
          )
          .map(getVisibleRect)
          .filter((rect): rect is DOMRect => rect !== null);

        if (selectorRects.length === 0) {
          missingSelectors.push(selector);
        }

        visibleRects.push(...selectorRects);
      });

      if (missingSelectors.length > 0) {
        throw new Error(`Visual capture selectors matched no visible elements: ${missingSelectors.join(', ')}`);
      }

      const pageWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth, window.innerWidth);
      const pageHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        window.innerHeight,
      );
      const left = Math.max(
        0,
        Math.floor(Math.min(...visibleRects.map((rect) => rect.left + window.scrollX)) - requestedPadding),
      );
      const top = Math.max(
        0,
        Math.floor(Math.min(...visibleRects.map((rect) => rect.top + window.scrollY)) - requestedPadding),
      );
      const right = Math.min(
        pageWidth,
        Math.ceil(Math.max(...visibleRects.map((rect) => rect.right + window.scrollX)) + requestedPadding),
      );
      const bottom = Math.min(
        pageHeight,
        Math.ceil(Math.max(...visibleRects.map((rect) => rect.bottom + window.scrollY)) + requestedPadding),
      );

      return {
        x: left,
        y: top,
        width: Math.max(1, right - left),
        height: Math.max(1, bottom - top),
      };
    },
    {
      descendantsIncluded: includeDescendants,
      requestedPadding: padding,
      requestedSelectors: selectors,
    },
  );
