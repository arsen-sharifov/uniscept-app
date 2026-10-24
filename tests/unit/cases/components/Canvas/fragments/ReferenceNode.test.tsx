import { fireEvent, render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { TReferenceNode } from '@interfaces';

import { listenOnPage } from '@mocks/browser';
import {
  AUTHORSHIP_TIMES,
  CANVAS_AUTHORS,
  THREAD_ID,
  nodeProps,
  referenceNode,
  REFERENCE_TARGET_URL,
} from '@mocks/canvas';
import { TRANSLATIONS, translate } from '@mocks/i18n';
import { router } from '@mocks/navigation';
import { FULL_ACCESS } from '@mocks/roles';
import { ReferenceNode } from '@/components/Canvas/fragments';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';

vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('next/navigation', () => import('@mocks/navigation'));

const onPagePress = vi.fn();

const renderReference = (node: TReferenceNode) =>
  render(
    <ReactFlowProvider>
      <ReferenceNode {...nodeProps(node)} />
    </ReactFlowProvider>,
  );

const openButton = () =>
  screen.queryByRole('button', {
    name: translate('platform.canvas.reference.openLabel', { name: referenceNode('ref').data.sourceNodeLabel }),
  });

beforeEach(() => {
  listenOnPage({ mousedown: onPagePress });
});

afterEach(() => {
  useCanvasStore.getState().clearCanvas();
  usePermissionsStore.getState().clearAccess();
});

describe('ReferenceNode', () => {
  describe('GIVEN a reference a member added last year', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', FULL_ACCESS);
      useCanvasStore.getState().loadCanvas(THREAD_ID, { nodes: [], edges: [], authors: CANVAS_AUTHORS });
      renderReference(referenceNode('ref', { createdBy: 'user-2', createdAt: AUTHORSHIP_TIMES.lastYear }));
    });

    describe('WHEN it renders', () => {
      test('THEN the member who added it and the date show', () => {
        expect(screen.getByText(CANVAS_AUTHORS['user-2'].name)).toBeInTheDocument();
        expect(screen.getByText('Mar 1, 2025')).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a reference to a node in another thread', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', FULL_ACCESS);
      renderReference(referenceNode('ref'));
    });

    describe('WHEN it renders', () => {
      test('THEN the source node, its workspace and thread show under the reference band', () => {
        expect(screen.getByText(TRANSLATIONS.platform.canvas.reference.badge)).toBeInTheDocument();
        expect(screen.getByText('Origin node')).toBeInTheDocument();
        expect(screen.getByText('Other workspace')).toBeInTheDocument();
        expect(screen.getByText('Other thread')).toBeInTheDocument();
        expect(openButton()).toBeInTheDocument();
      });
    });

    describe('WHEN the open button is clicked', () => {
      beforeEach(() => {
        fireEvent.click(openButton()!);
      });

      test('THEN the referenced node opens in its thread', () => {
        expect(router.push).toHaveBeenCalledExactlyOnceWith(REFERENCE_TARGET_URL);
      });
    });

    describe('WHEN the pointer goes down on the open button', () => {
      beforeEach(() => {
        fireEvent.mouseDown(openButton()!);
      });

      test('THEN the press stays on the button instead of reaching the canvas', () => {
        expect(onPagePress).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a reference whose source node id is missing', () => {
    beforeEach(() => {
      const node = referenceNode('ref');

      renderReference({ ...node, data: { ...node.data, sourceNodeId: '', sourceWorkspaceName: '' } });
    });

    describe('WHEN it renders', () => {
      test('THEN no open button is offered and the workspace falls back to the generic name', () => {
        expect(openButton()).not.toBeInTheDocument();
        expect(screen.getByText(TRANSLATIONS.platform.canvas.reference.workspaceFallback)).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a reference to a node that has no text yet', () => {
    beforeEach(() => {
      renderReference(referenceNode('ref', { sourceNodeLabel: '' }));
    });

    describe('WHEN it renders', () => {
      test('THEN a muted placeholder names the node, also for the open button', () => {
        expect(screen.getByText(TRANSLATIONS.platform.canvas.node.placeholder)).toHaveClass(
          'text-[color:var(--text-subtle)]',
        );
        expect(
          screen.getByRole('button', {
            name: translate('platform.canvas.reference.openLabel', {
              name: TRANSLATIONS.platform.canvas.node.placeholder,
            }),
          }),
        ).toBeInTheDocument();
      });
    });
  });
});
