import { Extension, type Extensions, Mark } from '@tiptap/core';
import { ListItem } from '@tiptap/extension-list';
import { CharacterCount, Placeholder, Selection } from '@tiptap/extensions';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { StarterKit } from '@tiptap/starter-kit';

import type { IEditorExtensionOptions } from '@interfaces';

import { isSafeLink, isTextColor, LINK_REL, LINK_TARGET, MAX_RICH_TEXT_BYTES } from '@/lib/richText';

const TextColor = Mark.create({
  name: 'textColor',

  addAttributes: () => ({
    color: {
      default: null,
      parseHTML: (element) => element.dataset.textColor,
      renderHTML: (attributes) => ({ 'data-text-color': attributes.color }),
    },
  }),

  parseHTML: () => [
    { tag: 'span[data-text-color]', getAttrs: (element) => (isTextColor(element.dataset.textColor) ? null : false) },
  ],

  renderHTML: ({ HTMLAttributes }) => ['span', HTMLAttributes, 0],
});

const PlainTextCharacterCount = CharacterCount.extend({
  onBeforeCreate(event) {
    this.parent?.(event);
    this.storage.characters = (options) => {
      const node = options?.node ?? this.editor.state.doc;

      return node.textBetween(0, node.content.size, '\n', '\n').length;
    };
  },
});

const serializedBytes = (node: ProseMirrorNode): number =>
  new TextEncoder().encode(JSON.stringify(node.toJSON())).length;

const SizeLimit = Extension.create({
  name: 'richTextSizeLimit',

  addProseMirrorPlugins: () => [
    new Plugin({
      key: new PluginKey('richTextSizeLimit'),
      filterTransaction: (transaction, state) => {
        if (!transaction.docChanged) return true;

        const nextBytes = serializedBytes(transaction.doc);

        return nextBytes <= MAX_RICH_TEXT_BYTES || nextBytes <= serializedBytes(state.doc);
      },
    }),
  ],
});

export const createEditorExtensions = (options: IEditorExtensionOptions): Extensions => [
  StarterKit.configure({
    blockquote: false,
    code: false,
    codeBlock: false,
    dropcursor: false,
    gapcursor: false,
    heading: false,
    horizontalRule: false,
    listItem: false,
    trailingNode: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
      HTMLAttributes: { target: LINK_TARGET, rel: LINK_REL },
      isAllowedUri: isSafeLink,
    },
  }),
  ListItem.extend({ content: 'paragraph' }),
  TextColor,
  Selection,
  PlainTextCharacterCount.configure({ limit: options.maxLength }),
  SizeLimit,
  Placeholder.configure({ placeholder: options.placeholder ?? '' }),
  options.keymap,
];
