import type { Editor } from '@tiptap/core';
import { beforeEach, describe, expect, test } from 'vitest';

import {
  LINKED_COLORED_HTML,
  LIST_HTML,
  OVERSIZED_INSERT,
  PASTED_BLOCKS_HTML,
  PASTED_COLOR_HTML,
  PASTED_LINK_HTML,
  SELECTED_WORD_HTML,
  TWO_PARAGRAPHS_HTML,
  mountTestEditor,
  stubEditorLayout,
} from '@mocks/richText';

let editor: Editor;

beforeEach(() => {
  stubEditorLayout();
});

describe('createEditorExtensions', () => {
  describe('GIVEN html with palette, unknown and inline colors', () => {
    beforeEach(() => {
      editor = mountTestEditor(PASTED_COLOR_HTML);
    });

    describe('WHEN the editor parses it', () => {
      test('THEN only the palette color survives as a text color mark', () => {
        expect(editor.getJSON().content?.[0]?.content).toEqual([
          { type: 'text', text: 'kept', marks: [{ type: 'textColor', attrs: { color: 'red' } }] },
          { type: 'text', text: 'unknownstyled' },
        ]);
      });
    });
  });

  describe('GIVEN html with an unsafe and a safe link', () => {
    beforeEach(() => {
      editor = mountTestEditor(PASTED_LINK_HTML);
    });

    describe('WHEN the editor parses it', () => {
      test('THEN the unsafe link is dropped and the safe one opens in a new tab', () => {
        expect(editor.getHTML()).toBe(
          '<p>bad <a target="_blank" rel="noopener noreferrer nofollow" href="https://ok.example">good</a></p>',
        );
      });
    });
  });

  describe('GIVEN html with headings, quotes, code and rules', () => {
    beforeEach(() => {
      editor = mountTestEditor(PASTED_BLOCKS_HTML);
    });

    describe('WHEN the editor parses it', () => {
      test('THEN everything collapses into plain paragraphs', () => {
        expect(editor.getJSON().content?.map((block) => block.type)).toEqual(['paragraph', 'paragraph', 'paragraph']);
        expect(editor.getText({ blockSeparator: '|' })).toBe('Heading|Quote|code()');
      });
    });
  });

  describe('GIVEN a document with a link, bold, color and a list', () => {
    beforeEach(() => {
      editor = mountTestEditor(LINKED_COLORED_HTML);
    });

    describe('WHEN the editor renders it back to html', () => {
      test('THEN the color is written as the palette attribute', () => {
        expect(editor.getHTML()).toContain('<span data-text-color="green">Linked</span>');
      });
    });
  });

  describe('GIVEN a list item', () => {
    beforeEach(() => {
      editor = mountTestEditor(LIST_HTML);
      editor.commands.setTextSelection(3);
    });

    describe('WHEN it is indented', () => {
      test('THEN lists stay flat', () => {
        expect(editor.commands.sinkListItem('listItem')).toBe(false);
      });
    });
  });

  describe('GIVEN two paragraphs that fill the length limit with their line break', () => {
    beforeEach(() => {
      editor = mountTestEditor(TWO_PARAGRAPHS_HTML, { maxLength: 5 });
    });

    describe('WHEN one more character is inserted', () => {
      beforeEach(() => {
        editor.commands.insertContentAt(editor.state.doc.content.size - 1, 'x');
      });

      test('THEN the line break counts towards the limit and the insertion is refused', () => {
        expect(editor.storage.characterCount.characters()).toBe(5);
        expect(editor.getText()).toBe('ab\n\ncd');
      });
    });
  });

  describe('GIVEN an editor whose character limit would allow a huge insertion', () => {
    beforeEach(() => {
      editor = mountTestEditor(SELECTED_WORD_HTML, { maxLength: OVERSIZED_INSERT.length * 2 });
    });

    describe('WHEN the insertion would push the saved document past its size cap', () => {
      beforeEach(() => {
        editor.commands.insertContentAt(1, OVERSIZED_INSERT);
      });

      test('THEN the insertion is refused so the save cannot fail later', () => {
        expect(editor.getText()).toBe('Pick this word');
      });
    });
  });
});
