'use client';

import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface ICommentActionProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

export const CommentAction = ({ icon: Icon, label, onClick, danger = false }: ICommentActionProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={clsx(
      'flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[color:var(--text-subtle)] transition-[background-color,color] duration-150 focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none motion-reduce:transition-none',
      danger
        ? 'hover:bg-[color:var(--status-error-bg)] hover:text-[color:var(--status-error)]'
        : 'hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)]',
    )}
  >
    <Icon className="h-3 w-3" strokeWidth={2} />
  </button>
);
