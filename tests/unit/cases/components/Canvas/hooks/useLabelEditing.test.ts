import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { THREAD_ID, canvasNode } from '@mocks/canvas';
import { FORMATTED_DOCUMENT, FORMATTED_TEXT, RESTYLED_DOCUMENT } from '@mocks/richText';
import { EDIT_ACCESS } from '@mocks/roles';
import { useLabelEditing } from '@/components/Canvas/hooks';
import { subscribeCanvasOperations } from '@/lib/canvas';
import { useOnboardingStore } from '@/lib/onboarding';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';

const storedData = (id = 'n1') => useCanvasStore.getState().nodes.find((node) => node.id === id)?.data;
const labelledSignal = () => useOnboardingStore.getState().signals.has('nodeLabelled');

const onOperation = vi.fn();

const unsubscribers: Array<() => void> = [];

let editor: { current: ReturnType<typeof useLabelEditing> };

beforeEach(() => {
  usePermissionsStore.getState().setAccess('ws-1', 'user-1', EDIT_ACCESS);
  useCanvasStore.getState().loadCanvas(THREAD_ID, {
    nodes: [
      canvasNode('n1', { label: 'Idea', createdBy: 'user-1' }),
      canvasNode('n2', { label: FORMATTED_TEXT, richLabel: FORMATTED_DOCUMENT, createdBy: 'user-1' }),
    ],
    edges: [],
    authors: {},
  });
  useCanvasStore.getState().setEditingNodeId('n1');
  useOnboardingStore.getState().startGuide('canvas');
  unsubscribers.push(subscribeCanvasOperations(onOperation));
});

afterEach(() => {
  unsubscribers.splice(0).forEach((unsubscribe) => unsubscribe());
  useOnboardingStore.getState().forget();
  useCanvasStore.getState().clearCanvas();
  usePermissionsStore.getState().clearAccess();
});

describe('useLabelEditing', () => {
  describe('GIVEN a node label being edited while a guide is running', () => {
    beforeEach(() => {
      editor = renderHook(() => useLabelEditing({ id: 'n1', label: 'Idea', signalLabelled: true })).result;
    });

    describe('WHEN a new plain label is committed', () => {
      beforeEach(() => {
        act(() => editor.current.commitLabel({ text: 'Better idea' }));
      });

      test('THEN the label is saved, editing ends and the guide learns the node was labelled', () => {
        expect(storedData()?.label).toBe('Better idea');
        expect(storedData()?.richLabel).toBeUndefined();
        expect(useCanvasStore.getState().editingNodeId).toBeNull();
        expect(labelledSignal()).toBe(true);
        expect(onOperation).toHaveBeenCalledWith({ type: 'updateNodeLabel', id: 'n1', label: 'Better idea' });
      });
    });

    describe('WHEN a formatted label is committed', () => {
      beforeEach(() => {
        act(() => editor.current.commitLabel({ text: FORMATTED_TEXT, document: FORMATTED_DOCUMENT }));
      });

      test('THEN the plain text and the formatting are saved together', () => {
        expect(storedData()?.label).toBe(FORMATTED_TEXT);
        expect(storedData()?.richLabel).toEqual(FORMATTED_DOCUMENT);
        expect(onOperation).toHaveBeenCalledWith({
          type: 'updateNodeLabel',
          id: 'n1',
          label: FORMATTED_TEXT,
          richLabel: FORMATTED_DOCUMENT,
        });
      });
    });

    describe('WHEN an empty label is committed', () => {
      beforeEach(() => {
        act(() => editor.current.commitLabel({ text: '' }));
      });

      test('THEN the previous label stays, editing ends and the guide is not told about a relabel', () => {
        expect(storedData()?.label).toBe('Idea');
        expect(useCanvasStore.getState().editingNodeId).toBeNull();
        expect(labelledSignal()).toBe(false);
        expect(onOperation).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the unchanged label is committed', () => {
      beforeEach(() => {
        act(() => editor.current.commitLabel({ text: 'Idea' }));
      });

      test('THEN editing ends without writing the label again', () => {
        expect(useCanvasStore.getState().editingNodeId).toBeNull();
        expect(onOperation).not.toHaveBeenCalled();
        expect(labelledSignal()).toBe(false);
      });
    });

    describe('WHEN editing is cancelled', () => {
      beforeEach(() => {
        act(() => editor.current.cancelEditing());
      });

      test('THEN editing ends without saving anything', () => {
        expect(storedData()?.label).toBe('Idea');
        expect(useCanvasStore.getState().editingNodeId).toBeNull();
        expect(onOperation).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a formatted label being edited', () => {
    beforeEach(() => {
      useCanvasStore.getState().setEditingNodeId('n2');
      editor = renderHook(() =>
        useLabelEditing({ id: 'n2', label: FORMATTED_TEXT, richLabel: FORMATTED_DOCUMENT }),
      ).result;
    });

    describe('WHEN the same text and an equal document are committed', () => {
      beforeEach(() => {
        act(() => editor.current.commitLabel({ text: FORMATTED_TEXT, document: structuredClone(FORMATTED_DOCUMENT) }));
      });

      test('THEN nothing is written', () => {
        expect(onOperation).not.toHaveBeenCalled();
      });
    });

    describe('WHEN only the formatting changes', () => {
      beforeEach(() => {
        act(() => editor.current.commitLabel({ text: FORMATTED_TEXT, document: RESTYLED_DOCUMENT }));
      });

      test('THEN the new formatting is saved under the same text', () => {
        expect(storedData('n2')?.richLabel).toEqual(RESTYLED_DOCUMENT);
        expect(onOperation).toHaveBeenCalledWith({
          type: 'updateNodeLabel',
          id: 'n2',
          label: FORMATTED_TEXT,
          richLabel: RESTYLED_DOCUMENT,
        });
      });
    });

    describe('WHEN the formatting is removed', () => {
      beforeEach(() => {
        act(() => editor.current.commitLabel({ text: FORMATTED_TEXT }));
      });

      test('THEN the label goes back to plain text', () => {
        expect(storedData('n2')?.richLabel).toBeUndefined();
        expect(onOperation).toHaveBeenCalledWith({ type: 'updateNodeLabel', id: 'n2', label: FORMATTED_TEXT });
      });
    });
  });

  describe('GIVEN a label edited by a node that does not report to the guide', () => {
    beforeEach(() => {
      editor = renderHook(() => useLabelEditing({ id: 'n1', label: 'Idea' })).result;
    });

    describe('WHEN a new label is committed', () => {
      beforeEach(() => {
        act(() => editor.current.commitLabel({ text: 'Question text' }));
      });

      test('THEN the label is saved without the labelled signal', () => {
        expect(storedData()?.label).toBe('Question text');
        expect(labelledSignal()).toBe(false);
      });
    });
  });
});
