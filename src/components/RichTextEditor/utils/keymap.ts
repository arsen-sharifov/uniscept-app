import { Extension } from '@tiptap/core';

import type { IEditorKeymapBinding, IEditorKeymapHandlers } from '@interfaces';

import { KEYMAP_PRIORITY } from '../consts';

export const createKeymapBinding = (): IEditorKeymapBinding => {
  let handlers: IEditorKeymapHandlers = {
    onSubmit: () => false,
    onCancel: () => false,
    onLink: () => false,
  };

  const extension = Extension.create({
    name: 'richTextKeymap',
    priority: KEYMAP_PRIORITY,

    addKeyboardShortcuts: () => ({
      Enter: ({ editor }) => !editor.isActive('listItem') && handlers.onSubmit(editor),
      'Mod-Enter': ({ editor }) => handlers.onSubmit(editor),
      'Shift-Enter': ({ editor }) =>
        editor.isActive('listItem') ? editor.commands.setHardBreak() : editor.commands.splitBlock(),
      Tab: ({ editor }) => editor.isActive('listItem'),
      'Shift-Tab': ({ editor }) => editor.isActive('listItem'),
      Escape: () => handlers.onCancel(),
      'Mod-k': ({ editor }) => handlers.onLink(editor),
    }),
  });

  return {
    extension,
    bind: (next) => {
      handlers = next;
    },
  };
};
