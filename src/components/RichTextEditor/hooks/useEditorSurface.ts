'use client';

import type { Editor } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import { useEditor, useEditorState } from '@tiptap/react';
import { clsx } from 'clsx';
import { type FocusEvent, useEffect, useMemo, useRef, useState } from 'react';

import type {
  IEditorSurfaceModel,
  IRichTextDocument,
  IRichTextEditorOptions,
  IRichTextValue,
  TFormattingToolbarMode,
} from '@interfaces';

import { fromPlainText, parseRichText, toRichTextValue } from '@/lib/richText';
import { isTypingTarget } from '@/lib/utils';

import { FOCUS_OPTIONS, TOOLBAR_POSITION } from '../consts';
import { createEditorExtensions, createKeymapBinding, createToolbarTracker } from '../utils';

const readDocument = (editor: Editor): IRichTextDocument => parseRichText(editor.getJSON()) ?? fromPlainText('');

const readValue = (editor: Editor): IRichTextValue => toRichTextValue(readDocument(editor));

export const useEditorSurface = ({
  text,
  document,
  ariaLabel,
  placeholder,
  maxLength,
  autoFocus = false,
  className,
  clearOnSubmit = false,
  onSubmit,
  onChange,
  onCancel,
  onLeave,
}: Omit<IRichTextEditorOptions, 'renderSubmit'>): IEditorSurfaceModel => {
  const [menuHost, setMenuHost] = useState<HTMLDivElement | null>(null);
  const [toolbarMode, setToolbarMode] = useState<TFormattingToolbarMode>('format');
  const [keymap] = useState(createKeymapBinding);
  const [extensions] = useState(() => createEditorExtensions({ placeholder, maxLength, keymap: keymap.extension }));
  const [content] = useState(() => document ?? fromPlainText(text));
  const [toolbarKey] = useState(() => new PluginKey('richTextToolbar'));
  const [toolbarTracker] = useState(() => createToolbarTracker(toolbarKey));

  const settledRef = useRef(false);

  const editorProps = useMemo(
    () => ({
      attributes: {
        class: clsx('rich-text rich-text-editor', className),
        role: 'textbox',
        'aria-label': ariaLabel,
        'aria-multiline': 'true',
      },
    }),
    [ariaLabel, className],
  );

  const isWithin = (editor: Editor, target: EventTarget | null): boolean =>
    target instanceof Node && (editor.view.dom.contains(target) || Boolean(menuHost?.contains(target)));

  const submitFrom = (editor: Editor) => {
    const value = readValue(editor);
    if (settledRef.current || (clearOnSubmit && !value.text)) return;

    settledRef.current = !clearOnSubmit;
    onSubmit(value);
    if (clearOnSubmit) editor.commands.clearContent(true);
  };

  const leaveFrom = (editor: Editor, target: EventTarget | null) => {
    if (isWithin(editor, target)) return;

    editor.view.dispatch(editor.state.tr.setMeta(toolbarKey, 'hide'));
    if (!onLeave || settledRef.current) return;

    settledRef.current = true;
    onLeave(readValue(editor));
  };

  const editor = useEditor({
    immediatelyRender: true,
    extensions,
    content,
    editorProps,
    onUpdate: ({ editor: current }) => onChange?.(readDocument(current)),
    onFocus: () => setToolbarMode('format'),
    onBlur: ({ editor: current, event }) => leaveFrom(current, event.relatedTarget),
  });

  const toolbarOptions = useMemo(
    () => ({
      ...TOOLBAR_POSITION,
      onShow: () => toolbarTracker.start(editor),
      onHide: () => {
        toolbarTracker.stop();
        setToolbarMode('format');
      },
    }),
    [editor, toolbarTracker],
  );

  const empty = useEditorState({
    editor,
    selector: ({ editor: current }) => !current.state.doc.textContent.trim(),
  });

  useEffect(() =>
    keymap.bind({
      onSubmit: (current) => {
        submitFrom(current);

        return true;
      },
      onCancel: () => {
        if (!onCancel || settledRef.current) return false;

        settledRef.current = true;
        onCancel();

        return true;
      },
      onLink: (current) => {
        if (current.state.selection.empty && !current.isActive('link')) return false;

        setToolbarMode('link');

        return true;
      },
    }),
  );

  useEffect(() => toolbarTracker.stop, [toolbarTracker]);

  useEffect(() => {
    if (!autoFocus) return;

    const focusEnd = () => {
      const active = globalThis.document.activeElement;
      if (active !== editor.view.dom && isTypingTarget(active)) return;

      editor.commands.focus('end', FOCUS_OPTIONS);
    };

    if (editor.isInitialized) focusEnd();
    else editor.on('create', focusEnd);

    return () => {
      editor.off('create', focusEnd);
    };
  }, [autoFocus, editor]);

  return {
    editor,
    empty,
    menuHost,
    setMenuHost,
    toolbarMode,
    setToolbarMode,
    toolbarKey,
    toolbarOptions,
    submit: () => submitFrom(editor),
    handleToolbarBlur: (event: FocusEvent<HTMLElement>) => leaveFrom(editor, event.relatedTarget),
  };
};
