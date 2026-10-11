import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { Canvas } from '@mocks/canvas';
import { routeParams } from '@mocks/navigation';
import ThreadPage from '@/app/platform/[workspaceId]/[threadId]/page';

vi.mock('next/navigation', () => import('@mocks/navigation'));
vi.mock('@/components', async () => ({ Canvas: (await import('@mocks/canvas')).Canvas }));

afterEach(() => {
  delete routeParams.workspaceId;
  delete routeParams.threadId;
  ['data-snap-to-grid', 'data-default-zoom', 'data-smart-guides'].forEach((attribute) =>
    document.documentElement.removeAttribute(attribute),
  );
});

describe('ThreadPage', () => {
  describe('GIVEN a route on a thread with tuned editor preferences', () => {
    beforeEach(() => {
      Object.assign(routeParams, { workspaceId: 'ws-1', threadId: 't1' });
      document.documentElement.setAttribute('data-snap-to-grid', 'false');
      document.documentElement.setAttribute('data-default-zoom', '150');
      document.documentElement.setAttribute('data-smart-guides', 'true');
    });

    describe('WHEN the page renders', () => {
      beforeEach(() => {
        render(<ThreadPage />);
      });

      test('THEN the canvas opens that thread with those preferences', () => {
        expect(Canvas).toHaveBeenLastCalledWith(
          { workspaceId: 'ws-1', threadId: 't1', snapToGrid: false, smartGuides: true, defaultZoom: 150 },
          undefined,
        );
      });
    });
  });

  describe('GIVEN a route without a thread', () => {
    beforeEach(() => {
      Object.assign(routeParams, { workspaceId: 'ws-1' });
    });

    describe('WHEN the page renders', () => {
      beforeEach(() => {
        render(<ThreadPage />);
      });

      test('THEN no canvas is mounted', () => {
        expect(Canvas).not.toHaveBeenCalled();
      });
    });
  });
});
