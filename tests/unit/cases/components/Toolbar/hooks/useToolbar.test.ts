import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { THREAD_ID, canvasNode } from '@mocks/canvas';
import { TRANSLATIONS } from '@mocks/i18n';
import { EDIT_ACCESS, READONLY_ACCESS } from '@mocks/roles';
import { useToolbar } from '@/components/Toolbar/hooks';
import { ECanvasTool } from '@/components/tools';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';

vi.mock('@/i18n', () => import('@mocks/i18n'));

let toolbar: { current: ReturnType<typeof useToolbar> };

afterEach(() => {
  useCanvasStore.getState().clearCanvas();
  usePermissionsStore.getState().clearAccess();
});

describe('useToolbar', () => {
  describe('GIVEN an editor on a freshly loaded canvas', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', EDIT_ACCESS);
      useCanvasStore.getState().loadCanvas(THREAD_ID, {
        nodes: [canvasNode('n1', { createdBy: 'user-1' })],
        edges: [],
      });
      toolbar = renderHook(() => useToolbar()).result;
    });

    describe('WHEN the toolbar renders', () => {
      test('THEN all five groups assemble in canonical order with translated labels', () => {
        expect(toolbar.current.groups.map((group) => ({ id: group.id, label: group.label }))).toEqual([
          { id: 'navigate', label: TRANSLATIONS.platform.canvas.tools.groups.navigate },
          { id: 'history', label: TRANSLATIONS.platform.canvas.tools.groups.history },
          { id: 'build', label: TRANSLATIONS.platform.canvas.tools.groups.build },
          { id: 'decide', label: TRANSLATIONS.platform.canvas.tools.groups.decide },
          { id: 'link', label: TRANSLATIONS.platform.canvas.tools.groups.link },
        ]);
      });

      test('THEN the select tool is active', () => {
        expect(toolbar.current.activeTool).toBe(ECanvasTool.Select);
      });

      test('THEN only the history tools are disabled', () => {
        const disabledByTool = Object.fromEntries(
          toolbar.current.groups.flatMap((group) => group.tools.map((tool) => [tool.id, tool.disabled] as const)),
        );

        expect(disabledByTool).toEqual({
          [ECanvasTool.Select]: false,
          [ECanvasTool.Pan]: false,
          [ECanvasTool.ZoomIn]: false,
          [ECanvasTool.ZoomOut]: false,
          [ECanvasTool.Undo]: true,
          [ECanvasTool.Redo]: true,
          [ECanvasTool.AddNode]: false,
          [ECanvasTool.Connect]: false,
          [ECanvasTool.Delete]: false,
          [ECanvasTool.ValidPath]: false,
          [ECanvasTool.InvalidPath]: false,
          [ECanvasTool.Answer]: false,
          [ECanvasTool.CrossReference]: false,
        });
      });
    });

    describe('WHEN a canvas tool is clicked', () => {
      beforeEach(() => {
        act(() => toolbar.current.handleToolClick(ECanvasTool.AddNode));
      });

      test('THEN the active tool switches in the hook and the store', () => {
        expect(toolbar.current.activeTool).toBe(ECanvasTool.AddNode);
        expect(useCanvasStore.getState().activeTool).toBe(ECanvasTool.AddNode);
      });
    });

    describe('WHEN a non-tool id is clicked', () => {
      beforeEach(() => {
        act(() => toolbar.current.handleToolClick('help'));
      });

      test('THEN the active tool stays on select', () => {
        expect(toolbar.current.activeTool).toBe(ECanvasTool.Select);
        expect(useCanvasStore.getState().activeTool).toBe(ECanvasTool.Select);
      });
    });

    describe('WHEN the middle pan engages', () => {
      beforeEach(() => {
        act(() => useCanvasStore.getState().setMiddlePan(true));
      });

      test('THEN the pan tool shows active while the stored tool stays select', () => {
        expect(toolbar.current.activeTool).toBe(ECanvasTool.Pan);
        expect(useCanvasStore.getState().activeTool).toBe(ECanvasTool.Select);
      });
    });
  });

  describe('GIVEN an editor who renamed a node on the canvas', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', EDIT_ACCESS);
      useCanvasStore.getState().loadCanvas(THREAD_ID, {
        nodes: [canvasNode('n1', { createdBy: 'user-1' })],
        edges: [],
      });
      toolbar = renderHook(() => useToolbar()).result;
      act(() => useCanvasStore.getState().updateNodeLabel('n1', 'Renamed'));
    });

    describe('WHEN the history availability is inspected', () => {
      test('THEN undo enables while redo stays disabled', () => {
        const historyGroup = toolbar.current.groups.find((group) => group.id === 'history');

        expect(historyGroup?.tools).toEqual([
          expect.objectContaining({ id: ECanvasTool.Undo, disabled: false }),
          expect.objectContaining({ id: ECanvasTool.Redo, disabled: true }),
        ]);
      });
    });

    describe('WHEN the undo tool is clicked', () => {
      beforeEach(() => {
        act(() => toolbar.current.handleToolClick(ECanvasTool.Undo));
      });

      test('THEN the rename rolls back', () => {
        expect(useCanvasStore.getState().nodes[0]).toMatchObject({ data: { label: 'Node n1' } });
      });

      test('THEN redo enables while undo disables', () => {
        const historyGroup = toolbar.current.groups.find((group) => group.id === 'history');

        expect(historyGroup?.tools).toEqual([
          expect.objectContaining({ id: ECanvasTool.Undo, disabled: true }),
          expect.objectContaining({ id: ECanvasTool.Redo, disabled: false }),
        ]);
      });
    });

    describe('WHEN the undo and the redo tools are clicked in turn', () => {
      beforeEach(() => {
        act(() => toolbar.current.handleToolClick(ECanvasTool.Undo));
        act(() => toolbar.current.handleToolClick(ECanvasTool.Redo));
      });

      test('THEN the rename returns', () => {
        expect(useCanvasStore.getState().nodes[0]).toMatchObject({ data: { label: 'Renamed' } });
      });

      test('THEN undo enables while redo disables', () => {
        const historyGroup = toolbar.current.groups.find((group) => group.id === 'history');

        expect(historyGroup?.tools).toEqual([
          expect.objectContaining({ id: ECanvasTool.Undo, disabled: false }),
          expect.objectContaining({ id: ECanvasTool.Redo, disabled: true }),
        ]);
      });
    });
  });

  describe('GIVEN a viewer without canvas edit access', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', READONLY_ACCESS);
      useCanvasStore.getState().loadCanvas(THREAD_ID, {
        nodes: [canvasNode('n1', { createdBy: 'user-2' })],
        edges: [],
      });
      toolbar = renderHook(() => useToolbar()).result;
    });

    describe('WHEN the toolbar renders', () => {
      test('THEN the edit groups are filtered out', () => {
        expect(toolbar.current.groups.map((group) => group.id)).toEqual(['navigate', 'history']);
      });

      test('THEN the navigation tools stay enabled while the history tools disable', () => {
        const disabledByTool = Object.fromEntries(
          toolbar.current.groups.flatMap((group) => group.tools.map((tool) => [tool.id, tool.disabled] as const)),
        );

        expect(disabledByTool).toEqual({
          [ECanvasTool.Select]: false,
          [ECanvasTool.Pan]: false,
          [ECanvasTool.ZoomIn]: false,
          [ECanvasTool.ZoomOut]: false,
          [ECanvasTool.Undo]: true,
          [ECanvasTool.Redo]: true,
        });
      });
    });
  });
});
