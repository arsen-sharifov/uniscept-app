import { Editor } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import { onTestFinished } from 'vitest';

import type { IEditorExtensionOptions, IRichTextDocument, IRichTextParagraph } from '@interfaces';

import { createEditorExtensions, createKeymapBinding } from '@/components/RichTextEditor/utils';
import { MAX_LINK_LENGTH, MAX_RICH_TEXT_BYTES } from '@/lib/richText';

import { stubProperty, stubRangeRects } from './browser';

const TEST_EDITOR_MAX_LENGTH = 40;

const paragraph = (text: string): IRichTextParagraph => ({ type: 'paragraph', content: [{ type: 'text', text }] });

const textDocument = (...lines: string[]): IRichTextDocument => ({ type: 'doc', content: lines.map(paragraph) });

export const FORMATTED_TEXT = 'Ship now';

export const FORMATTED_DOCUMENT: IRichTextDocument = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Ship ' },
        { type: 'text', text: 'now', marks: [{ type: 'bold' }] },
      ],
    },
  ],
};

export const RESTYLED_DOCUMENT: IRichTextDocument = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Ship ' },
        { type: 'text', text: 'now', marks: [{ type: 'italic' }] },
      ],
    },
  ],
};

export const SHOWCASE_TEXT = 'Read the brief\nRisks\nCosts\nFirst\nline two';

export const SHOWCASE_DOCUMENT: IRichTextDocument = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Read ', marks: [{ type: 'italic' }, { type: 'underline' }] },
        { type: 'text', text: 'the brief', marks: [{ type: 'link', attrs: { href: 'https://example.com/brief' } }] },
      ],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Risks', marks: [{ type: 'textColor', attrs: { color: 'red' } }] }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Costs', marks: [{ type: 'strike' }] }] }],
        },
      ],
    },
    {
      type: 'orderedList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'First' }, { type: 'hardBreak' }, { type: 'text', text: 'line two' }],
            },
          ],
        },
      ],
    },
  ],
};

export const PLAIN_DOCUMENT: IRichTextDocument = {
  type: 'doc',
  content: [paragraph('Plain line'), { type: 'paragraph' }, paragraph('After a gap')],
};

export const PLAIN_TEXT = 'Plain line\n\nAfter a gap';

export const BROKEN_LINE_DOCUMENT: IRichTextDocument = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'One' }, { type: 'hardBreak' }, { type: 'text', text: 'Two' }],
    },
  ],
};

export const PADDED_DOCUMENT: IRichTextDocument = {
  type: 'doc',
  content: [
    { type: 'paragraph' },
    paragraph('   '),
    {
      type: 'paragraph',
      content: [
        { type: 'hardBreak' },
        { type: 'text', text: '  Lead ', marks: [{ type: 'bold' }] },
        { type: 'text', text: 'text' },
      ],
    },
    { type: 'paragraph' },
    {
      type: 'bulletList',
      content: [
        { type: 'listItem', content: [paragraph('Point  ')] },
        { type: 'listItem', content: [paragraph('  ')] },
      ],
    },
    { type: 'paragraph', content: [{ type: 'text', text: ' ' }, { type: 'hardBreak' }] },
  ],
};

export const TRIMMED_PADDED_DOCUMENT: IRichTextDocument = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Lead ', marks: [{ type: 'bold' }] },
        { type: 'text', text: 'text' },
      ],
    },
    { type: 'paragraph' },
    { type: 'bulletList', content: [{ type: 'listItem', content: [paragraph('Point')] }] },
  ],
};

export const LEADING_LIST_DOCUMENT: IRichTextDocument = {
  type: 'doc',
  content: [
    {
      type: 'orderedList',
      content: [
        { type: 'listItem', content: [{ type: 'paragraph' }] },
        { type: 'listItem', content: [paragraph('  Only item  ')] },
      ],
    },
  ],
};

export const TRIMMED_LEADING_LIST_DOCUMENT: IRichTextDocument = {
  type: 'doc',
  content: [{ type: 'orderedList', content: [{ type: 'listItem', content: [paragraph('Only item')] }] }],
};

export const BLANK_DOCUMENT: IRichTextDocument = {
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: '  ' }, { type: 'hardBreak' }] },
    { type: 'paragraph' },
  ],
};

export const UNTRUSTED_DOCUMENT = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Dropped heading' }],
    },
    'not a node',
    {
      type: 'paragraph',
      attrs: { textAlign: 'center' },
      content: [
        {
          type: 'text',
          text: 'Kept',
          marks: [
            { type: 'bold' },
            { type: 'bold' },
            { type: 'link', attrs: { href: 'javascript:alert(1)' } },
            { type: 'textColor', attrs: { color: '#ff0000' } },
            { type: 'highlight' },
            null,
          ],
        },
        { type: 'text', text: '' },
        { type: 'text', text: 42 },
        { type: 'image', attrs: { src: 'x' } },
        {
          type: 'text',
          text: ' safe',
          marks: [{ type: 'link', attrs: { href: 'mailto:team@example.com', target: '_top' } }],
        },
        { type: 'hardBreak' },
      ],
    },
    { type: 'paragraph', content: 'not an array' },
    { type: 'bulletList', content: [] },
    {
      type: 'orderedList',
      attrs: { start: 4 },
      content: [
        { type: 'listItem', content: [paragraph('One'), paragraph('Two')] },
        { type: 'listItem', content: [] },
        { type: 'paragraph' },
      ],
    },
  ],
};

export const PARSED_UNTRUSTED_DOCUMENT: IRichTextDocument = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Kept', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' safe', marks: [{ type: 'link', attrs: { href: 'mailto:team@example.com' } }] },
        { type: 'hardBreak' },
      ],
    },
    { type: 'paragraph' },
    {
      type: 'orderedList',
      attrs: { start: 4 },
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'One' }, { type: 'hardBreak' }, { type: 'text', text: 'Two' }],
            },
          ],
        },
        { type: 'listItem', content: [{ type: 'paragraph' }] },
      ],
    },
  ],
};

export const EMPTY_DOCUMENT_JSON = { type: 'doc', content: [{ type: 'bulletList', content: [] }] };

export const NUMBERED_FROM_THREE_TEXT = 'Third\nFourth';

export const NUMBERED_FROM_THREE_DOCUMENT: IRichTextDocument = {
  type: 'doc',
  content: [
    {
      type: 'orderedList',
      attrs: { start: 3 },
      content: [
        { type: 'listItem', content: [paragraph('Third')] },
        { type: 'listItem', content: [paragraph('Fourth')] },
      ],
    },
  ],
};

export const IGNORED_LIST_STARTS_JSON = {
  type: 'doc',
  content: [
    { type: 'orderedList', attrs: { start: 1 }, content: [{ type: 'listItem', content: [paragraph('One')] }] },
    { type: 'orderedList', attrs: { start: 2.5 }, content: [{ type: 'listItem', content: [paragraph('Half')] }] },
    { type: 'bulletList', attrs: { start: 5 }, content: [{ type: 'listItem', content: [paragraph('Dot')] }] },
  ],
};

export const IGNORED_LIST_STARTS_DOCUMENT: IRichTextDocument = {
  type: 'doc',
  content: [
    { type: 'orderedList', content: [{ type: 'listItem', content: [paragraph('One')] }] },
    { type: 'orderedList', content: [{ type: 'listItem', content: [paragraph('Half')] }] },
    { type: 'bulletList', content: [{ type: 'listItem', content: [paragraph('Dot')] }] },
  ],
};

export const EMPTY_PARAGRAPH_DOCUMENT: IRichTextDocument = { type: 'doc', content: [{ type: 'paragraph' }] };

export const PREFIXED_FORMATTED_DOCUMENT: IRichTextDocument = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Do Ship ' },
        { type: 'text', text: 'now', marks: [{ type: 'bold' }] },
      ],
    },
  ],
};

export const MOVED_RECT = new DOMRect(40, 120, 30, 18);

export const LINKED_COLORED_HTML =
  '<p><a href="https://example.com/a"><strong><span data-text-color="green">Linked</span></strong></a> plain</p><ul><li><p>Item</p></li></ul>';

export const PASTED_COLOR_HTML =
  '<p><span data-text-color="red">kept</span><span data-text-color="pink">unknown</span><span style="color: red">styled</span></p>';

export const PASTED_LINK_HTML = '<p><a href="javascript:alert(1)">bad</a> <a href="https://ok.example">good</a></p>';

export const PASTED_BLOCKS_HTML =
  '<h1>Heading</h1><blockquote><p>Quote</p></blockquote><pre><code>code()</code></pre><hr>';

export const TWO_PARAGRAPHS_HTML = '<p>ab</p><p>cd</p>';

export const LIST_HTML = '<ul><li><p>First</p></li></ul>';

export const SELECTED_WORD_HTML = '<p>Pick this word</p>';

export const TRACKED_TOOLBAR_KEY = new PluginKey('trackedToolbar');

export const UNSAFE_LINK_DOCUMENT: IRichTextDocument = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Sneaky', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] }],
    },
  ],
};

export const REPEATED_DOCUMENT = textDocument('Same', 'Same', 'Other');

export const OVERLONG_LINK = `https://example.com/${'a'.repeat(MAX_LINK_LENGTH)}`;

export const OVERSIZED_INSERT = 'x'.repeat(MAX_RICH_TEXT_BYTES);

export const PADDED_DRAFT_DOCUMENT = textDocument('  Ship it  ');

export const BLANK_DRAFT_DOCUMENT = textDocument('   ');

export const TYPED_DRAFT_DOCUMENT = textDocument('Draft');

export const TRAILING_SPACE_DOCUMENT = textDocument('Check the ');

export const EDITOR_CRASH = new Error('The editor chunk failed to load');

export const editorOf = (element: HTMLElement): Editor => {
  const { editor } = element as HTMLElement & { editor?: Editor };
  if (!editor) throw new Error('No rich text editor is mounted on this element');

  return editor;
};

export const stubEditorLayout = () => {
  let rect = new DOMRect();
  stubProperty(document, 'elementFromPoint', () => null);
  stubRangeRects(() => rect);

  return {
    moveTo: (next: DOMRect) => {
      rect = next;
    },
  };
};

export const mountTestEditor = (
  content: IRichTextDocument | string,
  options: Partial<IEditorExtensionOptions> = {},
): Editor => {
  const element = document.createElement('div');
  document.body.append(element);
  const editor = new Editor({
    element,
    content,
    extensions: createEditorExtensions({
      maxLength: TEST_EDITOR_MAX_LENGTH,
      keymap: createKeymapBinding().extension,
      ...options,
    }),
  });
  onTestFinished(() => {
    editor.destroy();
    element.remove();
  });

  return editor;
};
