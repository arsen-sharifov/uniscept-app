'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ISearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export const SearchInput = ({ value, onChange, placeholder }: ISearchInputProps) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
      if (isEditable) return;
      if (event.key === '/') {
        event.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);

    return () => window.removeEventListener('keydown', handler);
  }, []);

  const hasValue = value.length > 0;

  return (
    <div className="group relative flex items-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-overlay)] transition-all duration-150 focus-within:border-[color:var(--border-active)] focus-within:bg-[color:var(--surface-elevated)] focus-within:shadow-[0_0_0_3px_var(--accent-soft)]">
      <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[color:var(--text-subtle)] transition-colors group-focus-within:text-[color:var(--accent)]" />
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && hasValue) {
            onChange('');
            event.currentTarget.blur();
          }
        }}
        placeholder={placeholder}
        className="w-full min-w-0 bg-transparent py-1.5 pr-7 pl-8 text-xs text-[color:var(--text)] placeholder:text-[color:var(--text-subtle)] focus:outline-none"
      />
      {hasValue && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-1.5 rounded-md p-0.5 text-[color:var(--text-subtle)] transition-colors hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text)]"
          tabIndex={-1}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};
