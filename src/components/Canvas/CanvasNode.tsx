'use client';

import {
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
  useState,
  useRef,
  useEffect,
} from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import { MessageSquare, Plus, Send, X } from 'lucide-react';
import type { TCanvasNode } from '@interfaces';
import { useCanvasStore } from '@/lib/stores';

const HANDLE_BASE =
  '!h-2.5 !w-2.5 !rounded-full !border !border-white !bg-emerald-500 !shadow-[0_0_0_3px_rgba(16,185,129,0.18)] !opacity-0 !transition-opacity';

export const CanvasNode = ({ id, data, selected }: NodeProps<TCanvasNode>) => {
  const { label, status, comments } = data;

  const pendingConnection = useCanvasStore((s) => s.pendingConnection);
  const updateNodeLabel = useCanvasStore((s) => s.updateNodeLabel);
  const addComment = useCanvasStore((s) => s.addComment);

  const isPending = pendingConnection === id;

  const [isEditing, setIsEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  useEffect(() => {
    if (!showComments) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setShowComments(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showComments]);

  const handleLabelBlur = (event: FocusEvent<HTMLInputElement>) => {
    updateNodeLabel(id, event.target.value.trim() || label);
    setIsEditing(false);
  };

  const handleLabelKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      updateNodeLabel(id, event.currentTarget.value.trim() || label);
      setIsEditing(false);
    }
    if (event.key === 'Escape') setIsEditing(false);
  };

  const handleCommentSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!commentText.trim()) return;
    addComment(id, commentText.trim());
    setCommentText('');
  };

  const isValid = status === 'valid';
  const isInvalid = status === 'invalid';
  const hasComments = comments.length > 0;

  return (
    <div
      className={clsx(
        'group/node relative flex max-w-[260px] min-w-[180px] overflow-visible rounded-2xl bg-white/95 backdrop-blur-md transition-shadow duration-200',
        'shadow-[0_1px_2px_-1px_rgba(15,23,42,0.08),0_8px_24px_-12px_rgba(15,23,42,0.18)]',
        'hover:shadow-[0_2px_4px_-1px_rgba(15,23,42,0.10),0_14px_36px_-16px_rgba(15,23,42,0.24)]',
        'ring-1 ring-inset',
        !selected &&
          !isPending &&
          !isValid &&
          !isInvalid &&
          'ring-black/[0.07]',
        isValid && 'ring-emerald-500/30',
        isInvalid && 'ring-red-500/30',
        selected && 'ring-2 ring-emerald-500/50',
        isPending &&
          'animate-[node-pulse_1.4s_ease-in-out_infinite] ring-2 ring-cyan-500/55'
      )}
    >
      <style>{`
        @keyframes node-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.35), 0 1px 2px -1px rgba(15,23,42,0.08), 0 8px 24px -12px rgba(15,23,42,0.18); }
          50%      { box-shadow: 0 0 0 6px rgba(6, 182, 212, 0.0),  0 1px 2px -1px rgba(15,23,42,0.08), 0 8px 24px -12px rgba(15,23,42,0.18); }
        }
      `}</style>

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

      <Handle
        id="top"
        type="source"
        position={Position.Top}
        className={clsx(HANDLE_BASE, 'group-hover/node:!opacity-100')}
      />
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        className={clsx(HANDLE_BASE, 'group-hover/node:!opacity-100')}
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className={clsx(HANDLE_BASE, 'group-hover/node:!opacity-100')}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className={clsx(HANDLE_BASE, 'group-hover/node:!opacity-100')}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-4 py-3">
        {isEditing ? (
          <input
            ref={inputRef}
            defaultValue={label}
            onBlur={handleLabelBlur}
            onKeyDown={handleLabelKeyDown}
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            className="nodrag w-full rounded-md bg-emerald-500/[0.04] px-1 py-0.5 text-[13.5px] font-medium tracking-tight text-neutral-900 ring-1 ring-emerald-500/30 outline-none"
          />
        ) : (
          <p
            onDoubleClick={(event) => {
              event.stopPropagation();
              setIsEditing(true);
            }}
            className="cursor-text text-[13.5px] leading-snug font-medium tracking-tight text-neutral-900 select-none"
          >
            {label}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-[10.5px] text-neutral-400">
          <span className="font-mono tracking-tight">
            {id.slice(0, 4).toUpperCase()}
          </span>
          {hasComments && (
            <>
              <span className="text-neutral-300">·</span>
              <button
                ref={triggerRef}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowComments((prev) => !prev);
                }}
                onMouseDown={(event) => event.stopPropagation()}
                className="nodrag inline-flex items-center gap-1 rounded-md text-neutral-500 transition-colors hover:text-emerald-700"
              >
                <MessageSquare className="h-2.5 w-2.5" strokeWidth={2} />
                <span className="font-medium">{comments.length}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {!hasComments && (
        <button
          ref={triggerRef}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setShowComments((prev) => !prev);
          }}
          onMouseDown={(event) => event.stopPropagation()}
          aria-label="Add a comment"
          className="nodrag absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border border-black/[0.06] bg-white text-neutral-400 opacity-0 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.18)] transition-[opacity,color,transform] duration-150 group-hover/node:opacity-100 hover:scale-105 hover:text-emerald-700"
        >
          <Plus className="h-3 w-3" strokeWidth={2.25} />
        </button>
      )}

      {showComments && (
        <div
          ref={panelRef}
          onClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          className="nodrag absolute top-0 left-full z-50 ml-3 flex w-72 flex-col overflow-hidden rounded-xl border border-black/[0.06] bg-white/95 shadow-[0_18px_48px_-16px_rgba(15,23,42,0.28)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-black/[0.05] px-3.5 py-2.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-tight text-neutral-700">
              <MessageSquare
                className="h-3 w-3 text-neutral-400"
                strokeWidth={2}
              />
              Comments
              {hasComments && (
                <span className="rounded-full bg-black/[0.05] px-1.5 py-px text-[9px] font-semibold text-neutral-500">
                  {comments.length}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowComments(false)}
              className="flex h-5 w-5 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-black/[0.05] hover:text-neutral-700"
              aria-label="Close"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto px-3 py-2.5">
            {comments.length === 0 ? (
              <p className="py-3 text-center text-[11px] text-neutral-400">
                No comments yet — start the conversation.
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg bg-neutral-50 px-3 py-2 text-[11.5px] leading-snug text-neutral-700 ring-1 ring-black/[0.04] ring-inset"
                >
                  {comment.text}
                </div>
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
              placeholder="Add a comment…"
              className="min-w-0 flex-1 bg-transparent px-1 text-[12px] text-neutral-800 outline-none placeholder:text-neutral-400"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500 text-white transition-[opacity,transform] duration-150 hover:scale-105 active:scale-95 disabled:opacity-30"
              aria-label="Send comment"
            >
              <Send className="h-3 w-3" strokeWidth={2.25} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
