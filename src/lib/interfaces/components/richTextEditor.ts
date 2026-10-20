import type { Editor, Extension } from '@tiptap/core';
import type { PluginKey } from '@tiptap/pm/state';
import type { BubbleMenuProps } from '@tiptap/react/menus';
import type { FocusEvent, ReactNode } from 'react';

import type { IRichTextDocument, IRichTextValue, TTextColor } from '@interfaces';

export type TFormattingToolbarMode = 'format' | 'link' | 'color';

export interface IRichTextSubmitControl {
  disabled: boolean;
  submit: () => void;
}

export interface IRichTextEditorOptions {
  text: string;
  document?: IRichTextDocument;
  ariaLabel: string;
  placeholder?: string;
  maxLength: number;
  autoFocus?: boolean;
  className?: string;
  clearOnSubmit?: boolean;
  onSubmit: (value: IRichTextValue) => void;
  onChange?: (document: IRichTextDocument) => void;
  onCancel?: () => void;
  onLeave?: (value: IRichTextValue) => void;
  renderSubmit?: (control: IRichTextSubmitControl) => ReactNode;
}

export interface IEditorKeymapHandlers {
  onSubmit: (editor: Editor) => boolean;
  onCancel: () => boolean;
  onLink: (editor: Editor) => boolean;
}

export interface IEditorKeymapBinding {
  extension: Extension;
  bind: (handlers: IEditorKeymapHandlers) => void;
}

export interface IEditorExtensionOptions {
  placeholder?: string;
  maxLength: number;
  keymap: Extension;
}

export interface IEditorSurfaceModel {
  editor: Editor;
  empty: boolean;
  menuHost: HTMLDivElement | null;
  setMenuHost: (host: HTMLDivElement | null) => void;
  toolbarMode: TFormattingToolbarMode;
  setToolbarMode: (mode: TFormattingToolbarMode) => void;
  toolbarKey: PluginKey;
  toolbarOptions: BubbleMenuProps['options'];
  submit: () => void;
  handleToolbarBlur: (event: FocusEvent<HTMLElement>) => void;
}

export interface IToolbarTracker {
  start: (editor: Editor) => void;
  stop: () => void;
}

export interface IFormattingState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  bulletList: boolean;
  orderedList: boolean;
  href: string | null;
  color: TTextColor | null;
}
