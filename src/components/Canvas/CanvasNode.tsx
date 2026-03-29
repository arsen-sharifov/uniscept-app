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
import { Send } from 'lucide-react';
import type { TCanvasNode } from '@interfaces';
import { useCanvasStore } from '@/lib/stores';

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
  const dotRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  useEffect(() => {
    if (!showComments) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        dotRef.current &&
        !dotRef.current.contains(e.target as Node)
      ) {
        setShowComments(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showComments]);

  const handleLabelBlur = (e: FocusEvent<HTMLInputElement>) => {
    updateNodeLabel(id, e.target.value.trim() || label);
    setIsEditing(false);
  };

  const handleLabelKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      updateNodeLabel(id, e.currentTarget.value.trim() || label);
      setIsEditing(false);
    }
    if (e.key === 'Escape') setIsEditing(false);
  };

  const handleCommentSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(id, commentText.trim());
    setCommentText('');
  };

  return (
    <div
      className={clsx(
        'group relative min-w-[160px] rounded-2xl border bg-white/80 px-4 py-3 shadow-lg backdrop-blur-xl transition-all',
        selected && 'ring-2 ring-emerald-400/50 ring-offset-1',
        isPending && 'ring-2 ring-cyan-400/60 ring-offset-1',
        status === 'valid' && 'border-emerald-400/60',
        status === 'invalid' && 'border-red-400/60',
        !status && !selected && !isPending && 'border-black/5'
      )}
    >
      {status && (
        <span
          className={clsx(
            'absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full border-2 border-white',
            status === 'valid' ? 'bg-emerald-500' : 'bg-red-500'
          )}
        />
      )}

      <Handle
        id="top"
        type="source"
        position={Position.Top}
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-gradient-to-br !from-emerald-400 !to-cyan-400 !opacity-0 !transition-opacity group-hover:!opacity-100"
      />
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-gradient-to-br !from-emerald-400 !to-cyan-400 !opacity-0 !transition-opacity group-hover:!opacity-100"
      />

      {isEditing ? (
        <input
          ref={inputRef}
          defaultValue={label}
          onBlur={handleLabelBlur}
          onKeyDown={handleLabelKeyDown}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="nodrag w-full bg-transparent text-sm font-medium text-black/70 outline-none"
        />
      ) : (
        <p
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="cursor-text text-sm font-medium text-black/70 select-none"
        >
          {label}
        </p>
      )}

      <button
        ref={dotRef}
        onClick={(e) => {
          e.stopPropagation();
          setShowComments((v) => !v);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="nodrag absolute -right-1.5 -bottom-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-black/15 transition-colors hover:bg-black/30"
        title="Comments"
      >
        {comments.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-[8px] font-bold text-white">
            {comments.length}
          </span>
        )}
      </button>

      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-gradient-to-br !from-emerald-400 !to-cyan-400 !opacity-0 !transition-opacity group-hover:!opacity-100"
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-gradient-to-br !from-emerald-400 !to-cyan-400 !opacity-0 !transition-opacity group-hover:!opacity-100"
      />

      {showComments && (
        <div
          ref={panelRef}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="nodrag absolute top-0 left-full z-50 ml-3 flex w-64 flex-col rounded-2xl border border-black/5 bg-white/90 shadow-xl backdrop-blur-xl"
        >
          <div className="flex max-h-48 flex-col gap-2 overflow-y-auto p-3">
            {comments.length === 0 ? (
              <p className="text-center text-xs text-black/30">
                No comments yet
              </p>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl bg-black/[0.03] px-3 py-2 text-xs text-black/60"
                >
                  {c.text}
                </div>
              ))
            )}
          </div>

          <div className="mx-3 border-t border-black/5" />

          <form
            onSubmit={handleCommentSubmit}
            className="flex items-center gap-2 p-3"
          >
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="min-w-0 flex-1 bg-transparent text-xs text-black/70 outline-none placeholder:text-black/30"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-white transition-opacity disabled:opacity-30"
            >
              <Send className="h-3 w-3" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
