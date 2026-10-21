'use client';

import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { Baseline } from 'lucide-react';
import type { FocusEvent, MouseEvent } from 'react';

import type { TFormattingToolbarMode } from '@interfaces';

import { useTranslations } from '@/i18n';
import { RICH_TEXT_LINK, RICH_TEXT_LISTS, RICH_TEXT_STYLES, TEXT_COLOR_VALUES } from '@/lib/richText';
import { stopPropagation } from '@/lib/utils';

import { FOCUS_OPTIONS } from '../consts';
import { readFormattingState } from '../utils';
import { ColorPalette } from './ColorPalette';
import { FormatButton } from './FormatButton';
import { LinkForm } from './LinkForm';
import { ToolbarDivider } from './ToolbarDivider';

interface IFormattingToolbarProps {
  editor: Editor;
  mode: TFormattingToolbarMode;
  onModeChange: (mode: TFormattingToolbarMode) => void;
  onBlur: (event: FocusEvent<HTMLElement>) => void;
}

const keepEditorFocus = (event: MouseEvent<HTMLElement>) => {
  event.stopPropagation();
  if (!(event.target instanceof HTMLInputElement)) event.preventDefault();
};

export const FormattingToolbar = ({ editor, mode, onModeChange, onBlur }: IFormattingToolbarProps) => {
  const t = useTranslations();
  const state = useEditorState({ editor, selector: ({ editor: current }) => readFormattingState(current) });

  const showFormatting = () => onModeChange('format');

  return (
    <div
      role="toolbar"
      aria-label={t.platform.canvas.formatting.toolbar}
      onMouseDown={keepEditorFocus}
      onClick={stopPropagation}
      onDoubleClick={stopPropagation}
      onContextMenu={stopPropagation}
      onKeyDown={stopPropagation}
      onBlur={onBlur}
      className="flex animate-rise-up items-start rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-1 font-grotesk text-[color:var(--text)] shadow-[var(--shadow-modal)] motion-reduce:animate-none"
    >
      {mode === 'link' && <LinkForm editor={editor} href={state.href} onDone={showFormatting} />}

      {mode === 'color' && <ColorPalette editor={editor} color={state.color} onDone={showFormatting} />}

      {mode === 'format' && (
        <div className="flex items-center gap-0.5">
          {RICH_TEXT_STYLES.map((style) => (
            <FormatButton
              key={style.id}
              icon={style.icon}
              label={t.platform.canvas.formatting[style.id]}
              shortcut={style.shortcut}
              active={state[style.id]}
              onClick={() => editor.chain().focus(null, FOCUS_OPTIONS).toggleMark(style.id).run()}
            />
          ))}

          <ToolbarDivider />

          <FormatButton
            icon={RICH_TEXT_LINK.icon}
            label={t.platform.canvas.formatting.link}
            shortcut={RICH_TEXT_LINK.shortcut}
            active={state.href !== null}
            onClick={() => onModeChange('link')}
          />
          <FormatButton
            icon={Baseline}
            label={t.platform.canvas.formatting.color}
            active={state.color !== null}
            iconStyle={state.color ? { color: TEXT_COLOR_VALUES[state.color] } : undefined}
            onClick={() => onModeChange('color')}
          />

          <ToolbarDivider />

          {RICH_TEXT_LISTS.map((list) => (
            <FormatButton
              key={list.id}
              icon={list.icon}
              label={t.platform.canvas.formatting[list.id]}
              shortcut={list.shortcut}
              active={state[list.id]}
              onClick={() => editor.chain().focus(null, FOCUS_OPTIONS).toggleList(list.id, 'listItem').run()}
            />
          ))}
        </div>
      )}
    </div>
  );
};
