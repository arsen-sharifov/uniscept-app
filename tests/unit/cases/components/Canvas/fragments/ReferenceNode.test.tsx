import { fireEvent, render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { TReferenceNode } from '@interfaces';

import { listenOnPage } from '@mocks/browser';
import { nodeProps, referenceNode, REFERENCE_TARGET_URL } from '@mocks/canvas';
import { TRANSLATIONS, translate } from '@mocks/i18n';
import { router } from '@mocks/navigation';
import { FULL_ACCESS } from '@mocks/roles';
import { ReferenceNode } from '@/components/Canvas/fragments';
import { usePermissionsStore } from '@/lib/stores';

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
  usePermissionsStore.getState().clearAccess();
});

describe('ReferenceNode', () => {
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
});
