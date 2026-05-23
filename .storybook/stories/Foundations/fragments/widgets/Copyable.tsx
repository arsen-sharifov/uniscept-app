'use client';

import { clsx } from 'clsx';
import { Copy } from 'lucide-react';
import { useState } from 'react';

import { COPY_FEEDBACK_DELAY_MS } from '../../../../consts';

interface ICopyableProps {
  value: string;
  display?: string;
  className?: string;
}

export const Copyable = ({ value, display, className }: ICopyableProps) => {
  const [copied, setCopied] = useState(false);

  const handle = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), COPY_FEEDBACK_DELAY_MS);
  };

  return (
    <button
      type="button"
      onClick={handle}
      title={copied ? 'Copied' : `Copy ${value}`}
      className={clsx(
        'group inline-flex items-center gap-1.5 rounded-md bg-[color:var(--surface-overlay)] px-2 py-0.5 font-mono text-[10.5px] tracking-[0.04em] text-[color:var(--text-muted)] transition-colors hover:bg-[color:var(--surface-elevated)] hover:text-[color:var(--text-strong)]',
        copied && 'bg-[color:var(--accent-soft)] text-[color:var(--accent-text)]',
        className,
      )}
    >
      <span className="truncate">{display ?? value}</span>
      <Copy
        className={clsx(
          'h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100',
          copied && 'opacity-100',
        )}
        strokeWidth={2}
      />
    </button>
  );
};
