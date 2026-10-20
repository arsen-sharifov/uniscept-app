import { type Editor, posToDOMRect } from '@tiptap/core';
import type { PluginKey } from '@tiptap/pm/state';
import type { BubbleMenuProps } from '@tiptap/react/menus';

import type { IToolbarTracker } from '@interfaces';

export const shouldShowToolbar: NonNullable<BubbleMenuProps['shouldShow']> = ({
  editor,
  element,
  view,
  state,
  from,
  to,
}) => {
  if (!editor.isEditable) return false;
  if (!view.hasFocus() && !element.contains(document.activeElement)) return false;
  if (editor.isActive('link')) return true;

  return !state.selection.empty && state.doc.textBetween(from, to).length > 0;
};

const selectionSignature = (editor: Editor): string => {
  const { from, to } = editor.state.selection;
  const { x, y, width, height } = posToDOMRect(editor.view, from, to);

  return [x, y, width, height].join(':');
};

export const createToolbarTracker = (pluginKey: PluginKey): IToolbarTracker => {
  let frame = 0;
  let signature = '';

  const follow = (editor: Editor) => {
    if (editor.isDestroyed) return;

    const next = selectionSignature(editor);
    if (next !== signature) editor.view.dispatch(editor.state.tr.setMeta(pluginKey, 'updatePosition'));
    signature = next;
    frame = requestAnimationFrame(() => follow(editor));
  };

  const stop = () => cancelAnimationFrame(frame);

  return {
    start: (editor) => {
      stop();
      signature = selectionSignature(editor);
      frame = requestAnimationFrame(() => follow(editor));
    },
    stop,
  };
};
