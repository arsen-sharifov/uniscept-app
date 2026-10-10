import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { domRect } from '@mocks/browser';
import { THREAD_ID, canvasNode } from '@mocks/canvas';
import { EDIT_ACCESS } from '@mocks/roles';
import { RubberLine } from '@/components/Canvas/fragments';
import { ECanvasTool } from '@/components/tools';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';

const rubberLine = () => document.querySelector('line');
const cursorDot = () => document.querySelector('circle');

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
    domRect({ left: 100, top: 50, width: 200, height: 80 }),
  );
  usePermissionsStore.getState().setAccess('ws-1', 'user-1', EDIT_ACCESS);
  useCanvasStore.getState().loadCanvas(THREAD_ID, { nodes: [canvasNode('n1'), canvasNode('n2')], edges: [] });
  useCanvasStore.getState().setActiveTool(ECanvasTool.Connect);
});

afterEach(() => {
  useCanvasStore.getState().clearCanvas();
  usePermissionsStore.getState().clearAccess();
});

describe('RubberLine', () => {
  describe('GIVEN the connect tool waiting for a target after picking a node on screen', () => {
    beforeEach(() => {
      useCanvasStore.getState().setPendingConnection('n1');
      render(
        <>
          <div className="react-flow__node" data-id="n1" />
          <RubberLine />
        </>,
      );
    });

    describe('WHEN nothing has moved yet', () => {
      test('THEN no line is drawn', () => {
        expect(rubberLine()).not.toBeInTheDocument();
      });
    });

    describe('WHEN the pointer moves', () => {
      beforeEach(() => {
        fireEvent.mouseMove(window, { clientX: 420, clientY: 300 });
      });

      test('THEN a line runs from the center of the picked node to the cursor', () => {
        expect(rubberLine()).toHaveAttribute('x1', '200');
        expect(rubberLine()).toHaveAttribute('y1', '90');
        expect(rubberLine()).toHaveAttribute('x2', '420');
        expect(rubberLine()).toHaveAttribute('y2', '300');
        expect(cursorDot()).toHaveAttribute('cx', '420');
        expect(cursorDot()).toHaveAttribute('cy', '300');
      });
    });

    describe('WHEN the pointer moves and the connection then ends', () => {
      beforeEach(() => {
        fireEvent.mouseMove(window, { clientX: 420, clientY: 300 });
        act(() => useCanvasStore.getState().setPendingConnection(null));
      });

      test('THEN the line is gone', () => {
        expect(rubberLine()).not.toBeInTheDocument();
      });
    });

    describe('WHEN the pointer moves after another tool was picked', () => {
      beforeEach(() => {
        act(() => useCanvasStore.setState({ activeTool: ECanvasTool.Select }));
        fireEvent.mouseMove(window, { clientX: 420, clientY: 300 });
      });

      test('THEN no line is drawn', () => {
        expect(rubberLine()).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN the connect tool waiting for a target whose picked node is not on screen', () => {
    beforeEach(() => {
      useCanvasStore.getState().setPendingConnection('n2');
      render(
        <>
          <div className="react-flow__node" data-id="n1" />
          <RubberLine />
        </>,
      );
    });

    describe('WHEN the pointer moves', () => {
      beforeEach(() => {
        fireEvent.mouseMove(window, { clientX: 420, clientY: 300 });
      });

      test('THEN no line is drawn', () => {
        expect(rubberLine()).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN the connect tool with no node picked', () => {
    beforeEach(() => {
      render(
        <>
          <div className="react-flow__node" data-id="n1" />
          <RubberLine />
        </>,
      );
    });

    describe('WHEN the pointer moves', () => {
      beforeEach(() => {
        fireEvent.mouseMove(window, { clientX: 420, clientY: 300 });
      });

      test('THEN no line is drawn', () => {
        expect(rubberLine()).not.toBeInTheDocument();
      });
    });
  });
});
