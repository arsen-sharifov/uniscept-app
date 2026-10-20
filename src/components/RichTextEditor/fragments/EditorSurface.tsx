'use client';

import { EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { createPortal } from 'react-dom';

import type { IRichTextEditorOptions } from '@interfaces';

import { stopPropagation } from '@/lib/utils';

import { TOOLBAR_UPDATE_DELAY_MS } from '../consts';
import { useEditorSurface } from '../hooks';
import { shouldShowToolbar } from '../utils';
import { FormattingToolbar } from './FormattingToolbar';

export const EditorSurface = ({ renderSubmit, ...options }: IRichTextEditorOptions) => {
  const {
    editor,
    empty,
    menuHost,
    setMenuHost,
    toolbarMode,
    setToolbarMode,
    toolbarKey,
    toolbarOptions,
    submit,
    handleToolbarBlur,
  } = useEditorSurface(options);

  return (
    <>
      <EditorContent
        editor={editor}
        onClick={stopPropagation}
        onMouseDown={stopPropagation}
        onDoubleClick={stopPropagation}
        onContextMenu={stopPropagation}
        className="nodrag nopan w-full min-w-0 cursor-text"
      />

      {renderSubmit?.({ disabled: empty, submit })}

      {createPortal(<div ref={setMenuHost} data-rich-text-toolbar />, document.body)}

      {menuHost && (
        <BubbleMenu
          editor={editor}
          pluginKey={toolbarKey}
          appendTo={menuHost}
          updateDelay={TOOLBAR_UPDATE_DELAY_MS}
          shouldShow={shouldShowToolbar}
          options={toolbarOptions}
          className="z-50"
        >
          <FormattingToolbar
            editor={editor}
            mode={toolbarMode}
            onModeChange={setToolbarMode}
            onBlur={handleToolbarBlur}
          />
        </BubbleMenu>
      )}
    </>
  );
};
