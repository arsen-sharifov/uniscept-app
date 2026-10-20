'use client';

import type { Editor } from '@tiptap/core';
import { Check, ChevronLeft, Unlink } from 'lucide-react';
import { type KeyboardEvent, type SubmitEvent, useId, useState } from 'react';

import { useTranslations } from '@/i18n';
import { normalizeLink } from '@/lib/richText';

import { FOCUS_OPTIONS } from '../consts';
import { FormatButton } from './FormatButton';
import { ToolbarDivider } from './ToolbarDivider';

interface ILinkFormProps {
  editor: Editor;
  href: string | null;
  onDone: () => void;
}

export const LinkForm = ({ editor, href, onDone }: ILinkFormProps) => {
  const t = useTranslations();
  const errorId = useId();

  const [value, setValue] = useState(href ?? '');
  const [invalid, setInvalid] = useState(false);

  const close = () => {
    editor.commands.focus(null, FOCUS_OPTIONS);
    onDone();
  };

  const applyLink = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const next = normalizeLink(value);
    if (!next) {
      setInvalid(true);

      return;
    }

    editor.chain().focus(null, FOCUS_OPTIONS).extendMarkRange('link').setLink({ href: next }).run();
    onDone();
  };

  const removeLink = () => {
    editor.chain().focus(null, FOCUS_OPTIONS).extendMarkRange('link').unsetLink().run();
    onDone();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Escape') return;

    event.preventDefault();
    event.stopPropagation();
    close();
  };

  return (
    <form onSubmit={applyLink} className="flex flex-col gap-1">
      <div className="flex items-center gap-0.5">
        <FormatButton icon={ChevronLeft} label={t.platform.canvas.formatting.back} onClick={close} />

        <ToolbarDivider />

        <input
          autoFocus
          type="text"
          inputMode="url"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setInvalid(false);
          }}
          onKeyDown={handleKeyDown}
          placeholder={t.platform.canvas.formatting.linkPlaceholder}
          aria-label={t.platform.canvas.formatting.linkAddress}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
          spellCheck={false}
          className="mx-0.5 h-7 w-52 min-w-0 rounded-lg bg-[color:var(--surface-soft)] px-2 text-[12px] text-[color:var(--text-strong)] caret-[color:var(--accent)] outline-none placeholder:text-[color:var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] aria-invalid:ring-1 aria-invalid:ring-[color:var(--status-error)]"
        />

        <button
          type="submit"
          aria-label={t.platform.canvas.formatting.applyLink}
          title={t.platform.canvas.formatting.applyLink}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[color:var(--accent-text)] transition-colors duration-150 hover:bg-[color:var(--accent-soft)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none motion-reduce:transition-none"
        >
          <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={2.25} />
        </button>

        {href && <FormatButton icon={Unlink} label={t.platform.canvas.formatting.removeLink} onClick={removeLink} />}
      </div>

      {invalid && (
        <p
          id={errorId}
          role="alert"
          className="px-1.5 pb-0.5 text-[11px] leading-snug text-[color:var(--status-error)]"
        >
          {t.platform.canvas.formatting.invalidLink}
        </p>
      )}
    </form>
  );
};
