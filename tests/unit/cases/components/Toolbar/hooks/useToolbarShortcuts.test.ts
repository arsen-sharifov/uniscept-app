import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { THREAD_ID } from '@mocks/canvas';
import { EDIT_ACCESS, READONLY_ACCESS } from '@mocks/roles';
import { useToolbarShortcuts } from '@/components/Toolbar/hooks';
import { ECanvasTool } from '@/components/tools';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';

const input = document.createElement('input');

const toggleShortcuts = vi.fn();

beforeEach(() => {
  document.body.append(input);
});

afterEach(() => {
  input.remove();
  useCanvasStore.getState().clearCanvas();
  usePermissionsStore.getState().clearAccess();
});

describe('useToolbarShortcuts', () => {
  describe('GIVEN an editor on a loaded canvas', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', EDIT_ACCESS);
      useCanvasStore.getState().loadCanvas(THREAD_ID, { nodes: [], edges: [] });
      renderHook(() => useToolbarShortcuts(toggleShortcuts));
    });

    describe('WHEN an editing tool key is pressed', () => {
      beforeEach(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', cancelable: true }));
      });

      test('THEN the tool switches', () => {
        expect(useCanvasStore.getState().activeTool).toBe(ECanvasTool.AddNode);
      });
    });

    describe('WHEN the key is typed into an input', () => {
      beforeEach(() => {
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', bubbles: true, cancelable: true }));
      });

      test('THEN the tool does not switch', () => {
        expect(useCanvasStore.getState().activeTool).toBe(ECanvasTool.Select);
      });
    });

    describe('WHEN a tool key is pressed with the ctrl modifier held', () => {
      beforeEach(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', ctrlKey: true, cancelable: true }));
      });

      test('THEN the tool does not switch', () => {
        expect(useCanvasStore.getState().activeTool).toBe(ECanvasTool.Select);
      });
    });

    describe('WHEN a tool key is pressed with the alt modifier held', () => {
      beforeEach(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', altKey: true, cancelable: true }));
      });

      test('THEN the tool does not switch', () => {
        expect(useCanvasStore.getState().activeTool).toBe(ECanvasTool.Select);
      });
    });

    describe('WHEN an unmapped key is pressed', () => {
      beforeEach(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q', cancelable: true }));
      });

      test('THEN the tool does not switch', () => {
        expect(useCanvasStore.getState().activeTool).toBe(ECanvasTool.Select);
      });
    });

    describe("WHEN '?' is pressed", () => {
      beforeEach(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '?', cancelable: true }));
      });

      test('THEN the shortcuts sheet toggles', () => {
        expect(toggleShortcuts).toHaveBeenCalledOnce();
      });
    });

    describe("WHEN '?' is typed into an input", () => {
      beforeEach(() => {
        input.dispatchEvent(new KeyboardEvent('keydown', { key: '?', bubbles: true, cancelable: true }));
      });

      test('THEN the shortcuts sheet stays as it is', () => {
        expect(toggleShortcuts).not.toHaveBeenCalled();
      });
    });

    describe("WHEN 'z' is pressed without a modifier", () => {
      beforeEach(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', cancelable: true }));
      });

      test('THEN the tool does not switch', () => {
        expect(useCanvasStore.getState().activeTool).toBe(ECanvasTool.Select);
      });
    });

    describe('WHEN the add-node key is pressed on the Ukrainian layout', () => {
      beforeEach(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'т', code: 'KeyN', cancelable: true }));
      });

      test('THEN the tool switches by the physical key', () => {
        expect(useCanvasStore.getState().activeTool).toBe(ECanvasTool.AddNode);
      });
    });

    describe('WHEN a Ukrainian letter without a Latin key position is pressed', () => {
      beforeEach(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'х', code: 'BracketLeft', cancelable: true }));
      });

      test('THEN the tool does not switch', () => {
        expect(useCanvasStore.getState().activeTool).toBe(ECanvasTool.Select);
      });
    });

    describe('WHEN the answer key is pressed on the French layout', () => {
      beforeEach(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', code: 'KeyQ', cancelable: true }));
      });

      test('THEN the printed letter decides the tool', () => {
        expect(useCanvasStore.getState().activeTool).toBe(ECanvasTool.Answer);
      });
    });
  });

  describe('GIVEN an editor who just added a node', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', EDIT_ACCESS);
      useCanvasStore.getState().loadCanvas(THREAD_ID, { nodes: [], edges: [] });
      renderHook(() => useToolbarShortcuts(toggleShortcuts));
      useCanvasStore.getState().addNode({ x: 0, y: 0 }, 'Draft');
    });

    describe('WHEN undo is pressed with the meta modifier', () => {
      beforeEach(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', metaKey: true, cancelable: true }));
      });

      test('THEN the addition is undone', () => {
        expect(useCanvasStore.getState().nodes).toHaveLength(0);
      });
    });

    describe('WHEN undo is pressed with the ctrl modifier', () => {
      beforeEach(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, cancelable: true }));
      });

      test('THEN the addition is undone', () => {
        expect(useCanvasStore.getState().nodes).toHaveLength(0);
      });
    });

    describe('WHEN redo is pressed with the meta modifier after an undo', () => {
      beforeEach(() => {
        useCanvasStore.getState().undo();
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'z', metaKey: true, shiftKey: true, cancelable: true }),
        );
      });

      test('THEN the addition returns', () => {
        expect(useCanvasStore.getState().nodes).toHaveLength(1);
      });
    });

    describe('WHEN redo is pressed with the ctrl modifier after an undo', () => {
      beforeEach(() => {
        useCanvasStore.getState().undo();
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true, cancelable: true }),
        );
      });

      test('THEN the addition returns', () => {
        expect(useCanvasStore.getState().nodes).toHaveLength(1);
      });
    });

    describe('WHEN undo is pressed with the ctrl modifier on the Ukrainian layout', () => {
      beforeEach(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'я', code: 'KeyZ', ctrlKey: true, cancelable: true }));
      });

      test('THEN the addition is undone', () => {
        expect(useCanvasStore.getState().nodes).toHaveLength(0);
      });
    });

    describe('WHEN redo is pressed with the ctrl modifier on the Ukrainian layout after an undo', () => {
      beforeEach(() => {
        useCanvasStore.getState().undo();
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Я', code: 'KeyZ', ctrlKey: true, shiftKey: true, cancelable: true }),
        );
      });

      test('THEN the addition returns', () => {
        expect(useCanvasStore.getState().nodes).toHaveLength(1);
      });
    });
  });

  describe('GIVEN a viewer on a loaded canvas', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', READONLY_ACCESS);
      useCanvasStore.getState().loadCanvas(THREAD_ID, { nodes: [], edges: [] });
      renderHook(() => useToolbarShortcuts(toggleShortcuts));
    });

    describe('WHEN an editing tool key is pressed', () => {
      beforeEach(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', cancelable: true }));
      });

      test('THEN the tool stays on select', () => {
        expect(useCanvasStore.getState().activeTool).toBe(ECanvasTool.Select);
      });
    });

    describe('WHEN a navigation tool key is pressed', () => {
      beforeEach(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', cancelable: true }));
      });

      test('THEN the tool switches', () => {
        expect(useCanvasStore.getState().activeTool).toBe(ECanvasTool.Pan);
      });
    });

    describe('WHEN the pan key is pressed on the Ukrainian layout', () => {
      beforeEach(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'р', code: 'KeyH', cancelable: true }));
      });

      test('THEN the tool switches by the physical key', () => {
        expect(useCanvasStore.getState().activeTool).toBe(ECanvasTool.Pan);
      });
    });

    describe('WHEN the add-node key is pressed on the Ukrainian layout', () => {
      beforeEach(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'т', code: 'KeyN', cancelable: true }));
      });

      test('THEN the tool stays on select', () => {
        expect(useCanvasStore.getState().activeTool).toBe(ECanvasTool.Select);
      });
    });
  });
});
