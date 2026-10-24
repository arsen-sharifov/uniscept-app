'use client';

import type { LucideIcon } from 'lucide-react';

interface ICommentSubmitButtonProps {
  icon: LucideIcon;
  label: string;
  disabled: boolean;
  onClick?: () => void;
}

export const CommentSubmitButton = ({ icon: Icon, label, disabled, onClick }: ICommentSubmitButtonProps) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[color:var(--accent)] text-[color:var(--on-accent)] transition-[background-color,opacity] duration-150 hover:bg-[color:var(--accent-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-[color:var(--surface-overlay)] disabled:text-[color:var(--text-subtle)] disabled:hover:bg-[color:var(--surface-overlay)] motion-reduce:transition-none"
    aria-label={label}
    title={label}
  >
    <Icon className="h-3 w-3" strokeWidth={2.25} />
  </button>
);
