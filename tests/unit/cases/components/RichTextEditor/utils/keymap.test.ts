import { fireEvent } from '@testing-library/react';
import type { Editor } from '@tiptap/core';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { IEditorKeymapBinding } from '@interfaces';

import { LIST_HTML, SELECTED_WORD_HTML, mountTestEditor, stubEditorLayout } from '@mocks/richText';
import { createKeymapBinding } from '@/components/RichTextEditor/utils';

const onSubmit = vi.fn(() => true);
const onCancel = vi.fn(() => true);
const onLink = vi.fn(() => true);

let binding: IEditorKeymapBinding;
let editor: Editor;

beforeEach(() => {
  stubEditorLayout();
  binding = createKeymapBinding();
});

describe('createKeymapBinding', () => {
  describe('GIVEN a paragraph and no bound handlers yet', () => {
    beforeEach(() => {
      editor = mountTestEditor(SELECTED_WORD_HTML, { keymap: binding.extension });
      editor.commands.setTextSelection(5);
    });

    describe('WHEN Enter, Escape and Mod-k are pressed', () => {
      beforeEach(() => {
        fireEvent.keyDown(editor.view.dom, { key: 'Enter' });
        fireEvent.keyDown(editor.view.dom, { key: 'Escape' });
        fireEvent.keyDown(editor.view.dom, { key: 'k', ctrlKey: true });
      });

      test('THEN the keys fall through to the default editing behaviour', () => {
        expect(editor.getJSON().content).toHaveLength(2);
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a paragraph with handlers bound', () => {
    beforeEach(() => {
      editor = mountTestEditor(SELECTED_WORD_HTML, { keymap: binding.extension });
      binding.bind({ onSubmit, onCancel, onLink });
      editor.commands.setTextSelection(5);
    });

    describe('WHEN Enter is pressed', () => {
      beforeEach(() => {
        fireEvent.keyDown(editor.view.dom, { key: 'Enter' });
      });

      test('THEN the text is submitted instead of split', () => {
        expect(onSubmit).toHaveBeenCalledExactlyOnceWith(editor);
        expect(editor.getJSON().content).toHaveLength(1);
      });
    });

    describe('WHEN Shift+Enter is pressed', () => {
      beforeEach(() => {
        fireEvent.keyDown(editor.view.dom, { key: 'Enter', shiftKey: true });
      });

      test('THEN a new paragraph starts without submitting', () => {
        expect(editor.getJSON().content?.map((block) => block.type)).toEqual(['paragraph', 'paragraph']);
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });

    describe('WHEN Escape is pressed', () => {
      beforeEach(() => {
        fireEvent.keyDown(editor.view.dom, { key: 'Escape' });
      });

      test('THEN the cancel handler runs', () => {
        expect(onCancel).toHaveBeenCalledOnce();
      });
    });

    describe('WHEN Tab is pressed outside a list', () => {
      let tabAllowed: boolean;

      beforeEach(() => {
        tabAllowed = fireEvent.keyDown(editor.view.dom, { key: 'Tab' });
      });

      test('THEN the browser may move focus as usual', () => {
        expect(tabAllowed).toBe(true);
      });
    });

    describe('WHEN Mod-k is pressed', () => {
      beforeEach(() => {
        fireEvent.keyDown(editor.view.dom, { key: 'k', ctrlKey: true });
      });

      test('THEN the link handler gets the editor', () => {
        expect(onLink).toHaveBeenCalledExactlyOnceWith(editor);
      });
    });
  });

  describe('GIVEN the caret inside a list item with handlers bound', () => {
    beforeEach(() => {
      editor = mountTestEditor(LIST_HTML, { keymap: binding.extension });
      binding.bind({ onSubmit, onCancel, onLink });
      editor.commands.setTextSelection(8);
    });

    describe('WHEN Enter is pressed', () => {
      beforeEach(() => {
        fireEvent.keyDown(editor.view.dom, { key: 'Enter' });
      });

      test('THEN a new item starts without submitting', () => {
        expect(editor.getJSON().content?.[0]?.content).toHaveLength(2);
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });

    describe('WHEN Shift+Enter is pressed', () => {
      beforeEach(() => {
        fireEvent.keyDown(editor.view.dom, { key: 'Enter', shiftKey: true });
      });

      test('THEN a line break goes into the same item', () => {
        expect(editor.getJSON().content?.[0]?.content).toHaveLength(1);
        expect(editor.getHTML()).toContain('<br>');
      });
    });

    describe('WHEN Tab and Shift+Tab are pressed', () => {
      let tabAllowed: boolean;
      let shiftTabAllowed: boolean;

      beforeEach(() => {
        tabAllowed = fireEvent.keyDown(editor.view.dom, { key: 'Tab' });
        shiftTabAllowed = fireEvent.keyDown(editor.view.dom, { key: 'Tab', shiftKey: true });
      });

      test('THEN focus stays in the editor and the flat list is unchanged', () => {
        expect(tabAllowed).toBe(false);
        expect(shiftTabAllowed).toBe(false);
        expect(editor.getHTML()).toBe('<ul><li><p>First</p></li></ul>');
      });
    });

    describe('WHEN Mod+Enter is pressed', () => {
      beforeEach(() => {
        fireEvent.keyDown(editor.view.dom, { key: 'Enter', ctrlKey: true });
      });

      test('THEN the text is submitted from inside the list', () => {
        expect(onSubmit).toHaveBeenCalledExactlyOnceWith(editor);
      });
    });
  });
});
