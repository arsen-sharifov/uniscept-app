'use client';

import { Send } from 'lucide-react';

import { useTranslations } from '@/i18n';

interface ISendCommentButtonProps {
  disabled: boolean;
  onClick?: () => void;
}

export const SendCommentButton = ({ disabled, onClick }: ISendCommentButtonProps) => {
  const t = useTranslations();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[color:var(--accent)] text-[color:var(--on-accent)] transition-[background-color,opacity] duration-150 hover:bg-[color:var(--accent-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-[color:var(--surface-overlay)] disabled:text-[color:var(--text-subtle)] disabled:hover:bg-[color:var(--surface-overlay)] motion-reduce:transition-none"
      aria-label={t.platform.canvas.node.sendComment}
    >
      <Send className="h-3 w-3" strokeWidth={2.25} />
    </button>
  );
};
