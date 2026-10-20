import type { Editor } from '@tiptap/core';

import type { IFormattingState } from '@interfaces';

import { isTextColor } from '@/lib/richText';

export const readFormattingState = (editor: Editor): IFormattingState => {
  const { href } = editor.getAttributes('link');
  const { color } = editor.getAttributes('textColor');

  return {
    bold: editor.isActive('bold'),
    italic: editor.isActive('italic'),
    underline: editor.isActive('underline'),
    strike: editor.isActive('strike'),
    bulletList: editor.isActive('bulletList'),
    orderedList: editor.isActive('orderedList'),
    href: typeof href === 'string' ? href : null,
    color: isTextColor(color) ? color : null,
  };
};
