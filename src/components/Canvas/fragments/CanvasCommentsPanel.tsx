'use client';

import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useTranslations } from '@hooks';
import { useCanvasStore } from '@/lib/stores';
import { INPUT_FOCUS_DELAY_MS } from '../consts';
import { isOwnComment } from '../utils';
import { CommentItem } from './CommentItem';

interface ICanvasCommentsPanelProps {
  open: boolean;
  onClose: () => void;
}

export const CanvasCommentsPanel = ({ open, onClose }: ICanvasCommentsPanelProps) => {
  const t = useTranslations();
  const comments = useCanvasStore((s) => s.canvasComments);
  const userId = useCanvasStore((s) => s.userId);
  const addCanvasComment = useCanvasStore((s) => s.addCanvasComment);
  const deleteCanvasComment = useCanvasStore((s) => s.deleteCanvasComment);

  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    const id = window.setTimeout(() => inputRef.current?.focus(), INPUT_FOCUS_DELAY_MS);

    return () => window.clearTimeout(id);
  }, [open]);

  if (!open) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    addCanvasComment(trimmed);
    setText('');
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();

    if (text) setText('');
    else onClose();
  };

  const hasComments = comments.length > 0;

  return (
    <div
      role="dialog"
      aria-label={t.platform.canvas.comments.panelTitle}
      className="animate-rise-down absolute top-4 left-4 z-30 flex w-72 flex-col overflow-hidden rounded-xl border border-black/[0.06] bg-white/95 shadow-[0_18px_48px_-16px_rgba(15,23,42,0.28)] backdrop-blur-xl motion-reduce:animate-none"
    >
      <div className="flex items-center justify-between border-b border-black/[0.05] px-3.5 py-2.5">
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-tight text-neutral-700">
          <MessageCircle className="h-3 w-3 text-neutral-400" strokeWidth={2} />
          {t.platform.canvas.comments.panelTitle}
          {hasComments && (
            <span className="rounded-full bg-black/[0.05] px-1.5 py-px text-[9px] font-semibold text-neutral-500">
              {comments.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-5 w-5 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-black/[0.05] hover:text-neutral-700"
          aria-label={t.platform.canvas.comments.closeAriaLabel}
          title={t.platform.canvas.comments.closeTitle}
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto px-3 py-2.5">
        {!hasComments ? (
          <div className="flex flex-col items-center gap-1.5 py-5 text-center">
            <MessageCircle className="h-5 w-5 text-neutral-300" strokeWidth={1.6} />
            <p className="text-[11px] text-neutral-400">{t.platform.canvas.comments.emptyTitle}</p>
            <p className="text-[10px] text-neutral-300">{t.platform.canvas.comments.emptyHint}</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              canDelete={isOwnComment(comment, userId)}
              onDelete={deleteCanvasComment}
            />
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-black/[0.05] px-2.5 py-2">
        <input
          ref={inputRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={t.platform.canvas.comments.addPlaceholder}
          aria-label={t.platform.canvas.comments.addAriaLabel}
          className="min-w-0 flex-1 bg-transparent px-1 text-[12px] text-neutral-800 outline-none placeholder:text-neutral-400"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500 text-white transition-[opacity,transform] duration-150 hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-30"
          aria-label={t.platform.canvas.comments.sendAriaLabel}
          title={t.platform.canvas.comments.sendTitle}
        >
          <Send className="h-3 w-3" strokeWidth={2.25} />
        </button>
      </form>
    </div>
  );
};
