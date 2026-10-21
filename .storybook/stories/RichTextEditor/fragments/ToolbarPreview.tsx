import { EditorContent, useEditor } from '@tiptap/react';
import { useState } from 'react';

import type { TFormattingToolbarMode } from '@interfaces';

import { FormattingToolbar } from '@/components/RichTextEditor/fragments';
import { createEditorExtensions, createKeymapBinding } from '@/components/RichTextEditor/utils';

import { TOOLBAR_PREVIEW_DOCUMENT, TOOLBAR_PREVIEW_MAX_LENGTH, TOOLBAR_PREVIEW_SELECTION } from '../consts';

interface IToolbarPreviewProps {
  mode: TFormattingToolbarMode;
  onModeChange: (mode: TFormattingToolbarMode) => void;
}

export const ToolbarPreview = ({ mode, onModeChange }: IToolbarPreviewProps) => {
  const [ready, setReady] = useState(false);
  const [keymap] = useState(createKeymapBinding);
  const [extensions] = useState(() =>
    createEditorExtensions({ maxLength: TOOLBAR_PREVIEW_MAX_LENGTH, keymap: keymap.extension }),
  );

  const editor = useEditor({
    immediatelyRender: true,
    extensions,
    content: TOOLBAR_PREVIEW_DOCUMENT,
    editorProps: {
      attributes: {
        class:
          'rich-text rich-text-editor font-grotesk text-[13.5px] leading-[1.55] font-medium tracking-tight text-[color:var(--text-strong)]',
      },
    },
    onCreate: ({ editor: created }) => {
      created.commands.setTextSelection(TOOLBAR_PREVIEW_SELECTION);
      setReady(true);
    },
  });

  return (
    <div data-visual-target className="inline-flex flex-col items-center gap-2">
      {ready && <FormattingToolbar editor={editor} mode={mode} onModeChange={onModeChange} onBlur={() => undefined} />}

      <div className="w-[260px] rounded-xl border border-[color:var(--border-active)] bg-[color:var(--surface-elevated)] px-4 py-3 shadow-[var(--shadow-pip)]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
