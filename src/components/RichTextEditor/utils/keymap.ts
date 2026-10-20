import { Extension } from '@tiptap/core';

import type { IEditorKeymapBinding } from '@interfaces';

import { IDLE_KEYMAP_HANDLERS, KEYMAP_PRIORITY } from '../consts';

export const createKeymapBinding = (): IEditorKeymapBinding => {
  let handlers = IDLE_KEYMAP_HANDLERS;

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
