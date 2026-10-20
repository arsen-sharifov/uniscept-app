import type { IRichTextDocument, TFormattingToolbarMode } from '@interfaces';

export const TOOLBAR_MODES: readonly TFormattingToolbarMode[] = ['format', 'link', 'color'];

export const TOOLBAR_PREVIEW_DOCUMENT: IRichTextDocument = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Voting slows fast canvases, see the ' },
        {
          type: 'text',
          text: 'pilot notes',
          marks: [{ type: 'link', attrs: { href: 'https://example.com/pilot' } }, { type: 'bold' }],
        },
      ],
    },
  ],
};

export const TOOLBAR_PREVIEW_SELECTION = { from: 37, to: 48 } as const;

export const TOOLBAR_PREVIEW_MAX_LENGTH = 500;
