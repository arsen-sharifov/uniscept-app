import { fireEvent, render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { stubResizeObserver } from '@mocks/browser';
import { THREAD_ID, nodeReference } from '@mocks/canvas';
import { TRANSLATIONS } from '@mocks/i18n';
import { EDIT_ACCESS } from '@mocks/roles';
import { ReferenceSearchPanel } from '@/components/Canvas/fragments';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';

vi.mock('@/i18n', () => import('@mocks/i18n'));

beforeEach(() => {
  stubResizeObserver();
  usePermissionsStore.getState().setAccess('ws-1', 'user-1', EDIT_ACCESS);
  useCanvasStore.getState().loadCanvas(THREAD_ID, { nodes: [], edges: [] });
});

afterEach(() => {
  useCanvasStore.getState().clearCanvas();
  usePermissionsStore.getState().clearAccess();
  vi.unstubAllGlobals();
});

describe('ReferenceSearchPanel', () => {
  describe('GIVEN no reference search was asked for', () => {
    beforeEach(() => {
      render(
        <ReactFlowProvider>
          <ReferenceSearchPanel />
        </ReactFlowProvider>,
      );
    });

    describe('WHEN the canvas renders', () => {
      test('THEN no search panel is shown', () => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN an editor with the reference search open at a canvas position', () => {
    beforeEach(() => {
      useCanvasStore.getState().setReferenceSearchPosition({ x: 100, y: 200 });
      render(
        <ReactFlowProvider>
          <ReferenceSearchPanel nodes={[nodeReference('r1')]} />
        </ReactFlowProvider>,
      );
    });

    describe('WHEN a result is clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: /Ref r1/ }));
      });

      test('THEN a reference to it lands at that position and the search closes', () => {
        expect(useCanvasStore.getState().nodes).toEqual([
          expect.objectContaining({
            position: { x: 100, y: 200 },
            data: expect.objectContaining({ sourceNodeId: 'r1', createdBy: 'user-1' }),
          }),
        ]);
        expect(useCanvasStore.getState().referenceSearchPosition).toBeNull();
        expect(
          screen.queryByRole('dialog', { name: TRANSLATIONS.platform.canvas.referenceSearch.placeholder }),
        ).not.toBeInTheDocument();
      });
    });

    describe('WHEN Escape is pressed', () => {
      beforeEach(() => {
        fireEvent.keyDown(window, { key: 'Escape' });
      });

      test('THEN the search closes without adding a reference', () => {
        expect(useCanvasStore.getState().referenceSearchPosition).toBeNull();
        expect(useCanvasStore.getState().nodes).toEqual([]);
      });
    });
  });
});
