import type { Editor } from '@tiptap/core';
import { beforeEach, describe, expect, test } from 'vitest';

import { LINKED_COLORED_HTML, mountTestEditor, stubEditorLayout } from '@mocks/richText';
import { readFormattingState } from '@/components/RichTextEditor/utils';

let editor: Editor;

beforeEach(() => {
  stubEditorLayout();
  editor = mountTestEditor(LINKED_COLORED_HTML);
});

describe('readFormattingState', () => {
  describe('GIVEN the caret inside bold, colored, linked text', () => {
    beforeEach(() => {
      editor.commands.setTextSelection(3);
    });

    describe('WHEN the state is read', () => {
      test('THEN the active marks, the link and the color are reported', () => {
        expect(readFormattingState(editor)).toEqual({
          bold: true,
          italic: false,
          underline: false,
          strike: false,
          bulletList: false,
          orderedList: false,
          href: 'https://example.com/a',
          color: 'green',
        });
      });
    });
  });

  describe('GIVEN the caret inside a plain list item', () => {
    beforeEach(() => {
      editor.commands.setTextSelection(editor.state.doc.content.size - 3);
    });

    describe('WHEN the state is read', () => {
      test('THEN only the bullet list is reported', () => {
        expect(readFormattingState(editor)).toEqual({
          bold: false,
          italic: false,
          underline: false,
          strike: false,
          bulletList: true,
          orderedList: false,
          href: null,
          color: null,
        });
      });
    });
  });
});
