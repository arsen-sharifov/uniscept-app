'use client';

import { Handle, type NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import { ChevronDown, MessageSquare, Send, X } from 'lucide-react';
import { type FocusEvent, type FormEvent, type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';

import type { TCanvasNode, TNodeBandTone } from '@interfaces';

import { useTranslations } from '@/i18n';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';
import { canEditNode } from '@/lib/utils';

import { HANDLE_POSITIONS, NODE_ALARM_WASHES } from './consts';
import { CommentItem, NodeBand } from './fragments';
import { isAffected, isOwnComment } from './utils';

export const CanvasNode = ({ id, data, selected }: NodeProps<TCanvasNode>) => {
  const t = useTranslations();
  const { label, status, comments, isNew, isAnswer, eligibleHint, effectiveStatus } = data;

  const pendingConnection = useCanvasStore((s) => s.pendingConnection);
  const editingNodeId = useCanvasStore((s) => s.editingNodeId);
  const setEditingNodeId = useCanvasStore((s) => s.setEditingNodeId);
  const openCommentsNodeId = useCanvasStore((s) => s.openCommentsNodeId);
  const setOpenCommentsNodeId = useCanvasStore((s) => s.setOpenCommentsNodeId);
  const updateNodeLabel = useCanvasStore((s) => s.updateNodeLabel);
  const addComment = useCanvasStore((s) => s.addComment);
  const deleteComment = useCanvasStore((s) => s.deleteComment);
  const clearNewFlag = useCanvasStore((s) => s.clearNewFlag);
  const userId = usePermissionsStore((s) => s.userId);
  const isOwner = usePermissionsStore((s) => s.isOwner);
  const canEditCanvas = usePermissionsStore((s) => s.canEditCanvas);
  const canComment = usePermissionsStore((s) => s.canComment);

  const canEdit = canEditNode(data.createdBy, { userId, isOwner, canEditCanvas });
  const isPending = pendingConnection === id;
  const isEditing = editingNodeId === id && canEdit;
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
    [],
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

  const isInvalid = status === 'invalid';
  const hasComments = comments.length > 0;

  const stateBands: { active: boolean; tone: TNodeBandTone; label: string }[] = [
    { active: isInvalid, tone: 'invalid', label: t.platform.canvas.node.invalidBadge },
    { active: isAffected(effectiveStatus), tone: 'affected', label: t.platform.canvas.node.affectedBadge },
    { active: isAnswer, tone: 'answer', label: t.platform.canvas.node.answerBadge },
    { active: status === 'valid', tone: 'valid', label: t.platform.canvas.node.validBadge },
  ];
  const stateBand = stateBands.find((band) => band.active);
  const wash = stateBand && !isEditing ? NODE_ALARM_WASHES[stateBand.tone] : undefined;

  return (
    <div
      data-export-node
      onAnimationEnd={isNew ? () => clearNewFlag(id) : undefined}
      style={wash ? { backgroundImage: `linear-gradient(${wash}, ${wash})` } : undefined}
      className={clsx(
        'group/node relative flex max-w-[260px] min-w-[180px] flex-col overflow-visible rounded-xl border bg-[color:var(--surface-elevated)] shadow-[var(--shadow-pip)] transition-[box-shadow,border-color,background-color,transform] duration-200 hover:-translate-y-px hover:shadow-[var(--shadow-card-hover)] motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        isEditing ? 'border-[color:var(--border-active)]' : 'border-[color:var(--border-strong)]',
        isNew && 'animate-node-drop motion-reduce:animate-none',
        selected && 'shadow-[var(--shadow-card-hover)] ring-[1.5px] ring-[color:var(--selection)]',
        isPending && 'animate-node-pulse ring-2 ring-[color:var(--ref-border)] motion-reduce:animate-none',
      )}
    >
      {eligibleHint && (
        <span
          data-export-omit
          aria-hidden
          className="pointer-events-none absolute -inset-[5px] animate-node-pulse rounded-[17px] border-2 border-dashed border-[color:var(--accent)]/55 motion-reduce:animate-none"
        />
      )}

      {HANDLE_POSITIONS.map(({ id: handleId, position }) => (
        <Handle
          key={handleId}
          id={handleId}
          type="source"
          position={position}
          isConnectable={canEditCanvas}
          className={clsx(
            '!h-2.5 !w-2.5 !rounded-full !border !border-[color:var(--surface)] !bg-[color:var(--accent)] !opacity-0 !shadow-[0_0_0_3px_var(--accent-soft)] !transition-opacity !duration-200',
            canEditCanvas ? 'group-hover/node:!opacity-100' : '!pointer-events-none',
          )}
        />
      ))}

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-4 py-3">
        {stateBand && <NodeBand tone={stateBand.tone} label={stateBand.label} />}

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
              className="nodrag field-sizing-content w-full resize-none overflow-hidden bg-transparent font-grotesk text-[13.5px] leading-[1.55] font-medium tracking-tight break-words text-[color:var(--text-strong)] caret-[color:var(--accent)] outline-none placeholder:text-[color:var(--text-muted)]"
            />
          ) : (
            <p
              ref={labelRefCallback}
              className={clsx(
                'min-w-0 flex-1 font-grotesk text-[13.5px] leading-[1.55] font-medium tracking-tight break-words whitespace-pre-wrap text-[color:var(--text-strong)] select-none',
                !expanded && 'line-clamp-10',
              )}
            >
              {label}
            </p>
          )}

          {!isEditing && (hasComments || canComment) && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setOpenCommentsNodeId(showComments ? null : id);
              }}
              onMouseDown={(event) => event.stopPropagation()}
              aria-label={hasComments ? t.platform.canvas.node.viewComments : t.platform.canvas.node.addComment}
              className={clsx(
                'nodrag mt-px inline-flex h-5 shrink-0 items-center gap-0.5 rounded-md transition-[opacity,color,background-color] duration-150 focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none motion-reduce:transition-none',
                hasComments
                  ? 'bg-[color:var(--accent-soft)] px-1.5 font-mono-ui text-[10px] font-bold text-[color:var(--accent-text)] hover:bg-[color:var(--accent-glow)]'
                  : 'w-5 justify-center text-[color:var(--text-faint)] opacity-0 group-hover/node:opacity-100 hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text)] focus-visible:opacity-100',
              )}
            >
              <MessageSquare className="h-2.5 w-2.5" strokeWidth={2.25} />
              {hasComments && <span className="tabular-nums">{comments.length}</span>}
            </button>
          )}
        </div>

        {!isEditing && (overflows || expanded) && (
          <button
            data-export-omit
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((prev) => !prev);
            }}
            onMouseDown={(event) => event.stopPropagation()}
            className="nodrag inline-flex w-fit items-center gap-1 rounded-md font-mono-ui text-[10px] tracking-[0.04em] text-[color:var(--text-muted)] transition-colors duration-150 hover:text-[color:var(--accent-text)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none motion-reduce:transition-none"
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
          data-export-omit
          onClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          className="nodrag absolute top-0 left-full z-50 ml-3 flex w-72 flex-col overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] font-grotesk text-[color:var(--text)] shadow-[var(--shadow-modal)]"
        >
          <div className="flex items-center justify-between border-b border-[color:var(--border)] px-3.5 py-2.5">
            <div className="flex items-center gap-2 font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--text-label)] uppercase">
              <MessageSquare className="h-3 w-3" strokeWidth={2.5} />
              {t.platform.canvas.node.commentsHeader}
              {hasComments && (
                <span className="rounded-full bg-[color:var(--surface-overlay)] px-1.5 py-px text-[9px] tracking-[0.08em] text-[color:var(--text-muted)] tabular-nums">
                  {comments.length}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpenCommentsNodeId(null)}
              className="flex h-5 w-5 items-center justify-center rounded-md text-[color:var(--text-muted)] transition-colors duration-150 hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none motion-reduce:transition-none"
              aria-label={t.platform.canvas.node.closeComments}
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto px-3 py-2.5">
            {comments.length === 0 ? (
              <p className="mx-auto max-w-[200px] py-4 text-center text-[11px] leading-snug text-[color:var(--text-muted)]">
                {t.platform.canvas.node.noComments}
              </p>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  canDelete={canComment && isOwnComment(comment, userId)}
                  onDelete={(commentId) => deleteComment(id, commentId)}
                />
              ))
            )}
          </div>

          {canComment && (
            <form
              onSubmit={handleCommentSubmit}
              className="flex items-center gap-2 border-t border-[color:var(--border)] px-2.5 py-2"
            >
              <input
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder={t.platform.canvas.node.addCommentPlaceholder}
                className="min-w-0 flex-1 bg-transparent px-1 text-[12px] text-[color:var(--text-strong)] caret-[color:var(--accent)] outline-none placeholder:text-[color:var(--text-muted)]"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[color:var(--accent)] text-[color:var(--on-accent)] transition-[background-color,opacity] duration-150 hover:bg-[color:var(--accent-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-[color:var(--surface-overlay)] disabled:text-[color:var(--text-subtle)] disabled:hover:bg-[color:var(--surface-overlay)] motion-reduce:transition-none"
                aria-label={t.platform.canvas.node.sendComment}
              >
                <Send className="h-3 w-3" strokeWidth={2.25} />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
