'use client';

import { type FocusEvent, type FormEvent, type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Handle, type NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import { ChevronDown, MessageSquare, Send, X } from 'lucide-react';
import type { TCanvasNode } from '@interfaces';
import { useTranslations } from '@hooks';
import { useCanvasStore } from '@/lib/stores';
import { HANDLE_POSITIONS, LABEL_CLAMP_STYLE, TEXTAREA_FIELD_SIZING_STYLE } from './consts';
import { CommentItem } from './fragments';
import { isOwnComment } from './utils';

export const CanvasNode = ({ id, data, selected }: NodeProps<TCanvasNode>) => {
  const t = useTranslations();
  const { label, status, comments, isNew } = data;

  const pendingConnection = useCanvasStore((s) => s.pendingConnection);
  const editingNodeId = useCanvasStore((s) => s.editingNodeId);
  const setEditingNodeId = useCanvasStore((s) => s.setEditingNodeId);
  const openCommentsNodeId = useCanvasStore((s) => s.openCommentsNodeId);
  const setOpenCommentsNodeId = useCanvasStore((s) => s.setOpenCommentsNodeId);
  const updateNodeLabel = useCanvasStore((s) => s.updateNodeLabel);
  const addComment = useCanvasStore((s) => s.addComment);
  const deleteComment = useCanvasStore((s) => s.deleteComment);
  const clearNewFlag = useCanvasStore((s) => s.clearNewFlag);
  const userId = useCanvasStore((s) => s.userId);

  const isPending = pendingConnection === id;
  const isEditing = editingNodeId === id;
  const showComments = openCommentsNodeId === id;

  const [commentText, setCommentText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!isEditing) return;

    const input = inputRef.current;
    if (!input) return;

    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }, [isEditing]);

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    },
    []
  );

  const labelRefCallback = useCallback((node: HTMLParagraphElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node) return;

    const measure = () => setOverflows(node.scrollHeight - node.clientHeight > 1);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  const handleLabelBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
    updateNodeLabel(id, event.target.value.trim() || label);
    setEditingNodeId(null);
  };

  const handleLabelKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      updateNodeLabel(id, event.currentTarget.value.trim() || label);
      setEditingNodeId(null);
      return;
    }

    if (event.key === 'Escape') setEditingNodeId(null);
  };

  const handleCommentSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;

    addComment(id, trimmed);
    setCommentText('');
  };

  const isValid = status === 'valid';
  const isInvalid = status === 'invalid';
  const hasComments = comments.length > 0;

  return (
    <div
      onAnimationEnd={isNew ? () => clearNewFlag(id) : undefined}
      className={clsx(
        'group/node relative flex max-w-[260px] min-w-[180px] overflow-visible rounded-2xl bg-white/95 backdrop-blur-md transition-shadow duration-200',
        'shadow-[0_1px_2px_-1px_rgba(15,23,42,0.08),0_8px_24px_-12px_rgba(15,23,42,0.18)]',
        'hover:shadow-[0_2px_4px_-1px_rgba(15,23,42,0.10),0_14px_36px_-16px_rgba(15,23,42,0.24)]',
        'ring-1 ring-inset',
        isNew && 'animate-node-drop motion-reduce:animate-none',
        !selected && !isPending && !isValid && !isInvalid && 'ring-black/[0.07]',
        isValid && 'ring-emerald-500/30',
        isInvalid && 'ring-red-500/30',
        selected && 'ring-2 ring-emerald-500/50',
        isPending && 'animate-node-pulse ring-2 ring-cyan-500/55 motion-reduce:animate-none'
      )}
    >
      {(isValid || isInvalid) && (
        <span
          aria-hidden
          className={clsx(
            'absolute top-2 bottom-2 left-0 w-[3px] rounded-r-full',
            isValid && 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]',
            isInvalid && 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
          )}
        />
      )}

      {HANDLE_POSITIONS.map(({ id: handleId, position }) => (
        <Handle
          key={handleId}
          id={handleId}
          type="source"
          position={position}
          className="!h-2.5 !w-2.5 !rounded-full !border !border-white !bg-emerald-500 !opacity-0 !shadow-[0_0_0_3px_rgba(16,185,129,0.18)] !transition-opacity group-hover/node:!opacity-100"
        />
      ))}

      <div className="flex min-w-0 flex-1 flex-col gap-1 px-4 py-3">
        <div className="flex min-w-0 items-start gap-2">
          {isEditing ? (
            <textarea
              ref={inputRef}
              defaultValue={label}
              onBlur={handleLabelBlur}
              onKeyDown={handleLabelKeyDown}
              onClick={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
              rows={1}
              style={TEXTAREA_FIELD_SIZING_STYLE}
              className="nodrag w-full resize-none overflow-hidden rounded-md bg-emerald-500/[0.04] px-1 py-0.5 text-[13.5px] leading-snug font-medium tracking-tight text-neutral-900 ring-1 ring-emerald-500/30 outline-none"
            />
          ) : (
            <p
              ref={labelRefCallback}
              style={!expanded ? LABEL_CLAMP_STYLE : undefined}
              className="min-w-0 flex-1 text-[13.5px] leading-snug font-medium tracking-tight break-words whitespace-pre-wrap text-neutral-900 select-none"
            >
              {label}
            </p>
          )}

          {!isEditing && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setOpenCommentsNodeId(showComments ? null : id);
              }}
              onMouseDown={(event) => event.stopPropagation()}
              aria-label={hasComments ? t.platform.canvas.node.viewComments : t.platform.canvas.node.addComment}
              className={clsx(
                'nodrag mt-px inline-flex h-5 shrink-0 items-center gap-0.5 rounded-md transition-[opacity,colors,padding] duration-150',
                hasComments
                  ? 'bg-emerald-500/10 px-1.5 text-[10.5px] font-semibold text-emerald-700 hover:bg-emerald-500/[0.16]'
                  : 'w-5 justify-center text-neutral-300 opacity-0 group-hover/node:opacity-100 hover:bg-black/[0.04] hover:text-neutral-700'
              )}
            >
              <MessageSquare className="h-2.5 w-2.5" strokeWidth={2.25} />
              {hasComments && <span>{comments.length}</span>}
            </button>
          )}
        </div>

        {!isEditing && (overflows || expanded) && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((prev) => !prev);
            }}
            onMouseDown={(event) => event.stopPropagation()}
            className="nodrag inline-flex w-fit items-center gap-0.5 rounded-md text-[10.5px] font-medium tracking-tight text-emerald-700/80 transition-colors hover:text-emerald-700"
          >
            <ChevronDown
              className={clsx('h-3 w-3 transition-transform duration-200', expanded && 'rotate-180')}
              strokeWidth={2.25}
            />
            {expanded ? t.platform.canvas.node.showLess : t.platform.canvas.node.showMore}
          </button>
        )}
      </div>

      {showComments && (
        <div
          onClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          className="nodrag absolute top-0 left-full z-50 ml-3 flex w-72 flex-col overflow-hidden rounded-xl border border-black/[0.06] bg-white/95 shadow-[0_18px_48px_-16px_rgba(15,23,42,0.28)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-black/[0.05] px-3.5 py-2.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-tight text-neutral-700">
              <MessageSquare className="h-3 w-3 text-neutral-400" strokeWidth={2} />
              {t.platform.canvas.node.commentsHeader}
              {hasComments && (
                <span className="rounded-full bg-black/[0.05] px-1.5 py-px text-[9px] font-semibold text-neutral-500">
                  {comments.length}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpenCommentsNodeId(null)}
              className="flex h-5 w-5 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-black/[0.05] hover:text-neutral-700"
              aria-label={t.platform.canvas.node.closeComments}
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto px-3 py-2.5">
            {comments.length === 0 ? (
              <p className="py-3 text-center text-[11px] text-neutral-400">{t.platform.canvas.node.noComments}</p>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  canDelete={isOwnComment(comment, userId)}
                  onDelete={(commentId) => deleteComment(id, commentId)}
                />
              ))
            )}
          </div>

          <form
            onSubmit={handleCommentSubmit}
            className="flex items-center gap-2 border-t border-black/[0.05] px-2.5 py-2"
          >
            <input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder={t.platform.canvas.node.addCommentPlaceholder}
              className="min-w-0 flex-1 bg-transparent px-1 text-[12px] text-neutral-800 outline-none placeholder:text-neutral-400"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500 text-white transition-[opacity,transform] duration-150 hover:scale-105 active:scale-95 disabled:opacity-30"
              aria-label={t.platform.canvas.node.sendComment}
            >
              <Send className="h-3 w-3" strokeWidth={2.25} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
