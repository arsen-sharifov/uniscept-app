'use client';

import type { KeyboardEvent } from 'react';

interface IInlineRenameInputProps {
  value: string;
  onChange: (value: string) => void;
  onCommit: () => void;
  onKeyDown: (event: KeyboardEvent) => void;
  inputRef: (element: HTMLInputElement | null) => void;
}

export const InlineRenameInput = ({ value, onChange, onCommit, onKeyDown, inputRef }: IInlineRenameInputProps) => (
  <input
    ref={inputRef}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    onBlur={onCommit}
    onKeyDown={onKeyDown}
    onClick={(event) => event.stopPropagation()}
    className="min-w-0 flex-1 truncate border-0 bg-transparent p-0 underline decoration-[color:var(--accent)] decoration-2 underline-offset-[3px] caret-[color:var(--accent)] outline-none [font:inherit] selection:bg-[color:var(--accent-soft)]"
  />
);
