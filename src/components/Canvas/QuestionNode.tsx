'use client';

import { Handle, type NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';
import { type FocusEvent, type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';

import type { TCanvasNode } from '@interfaces';

import { useTranslations } from '@/i18n';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';
import { canEditNode } from '@/lib/utils';

import { HANDLE_POSITIONS } from './consts';
import { NodeBand } from './fragments';

export const QuestionNode = ({ id, data, selected }: NodeProps<TCanvasNode>) => {
  const t = useTranslations();
  const { label } = data;

  const pendingConnection = useCanvasStore((s) => s.pendingConnection);
  const editingNodeId = useCanvasStore((s) => s.editingNodeId);
  const setEditingNodeId = useCanvasStore((s) => s.setEditingNodeId);
  const updateNodeLabel = useCanvasStore((s) => s.updateNodeLabel);
  const userId = usePermissionsStore((s) => s.userId);
  const isOwner = usePermissionsStore((s) => s.isOwner);
  const canEditCanvas = usePermissionsStore((s) => s.canEditCanvas);

  const canEdit = canEditNode(data.createdBy, { userId, isOwner, canEditCanvas });
  const isPending = pendingConnection === id;
  const isEditing = editingNodeId === id && canEdit;
  const hasLabel = label.trim().length > 0;

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

  const commit = (value: string) => {
    updateNodeLabel(id, value.trim() || label);
    setEditingNodeId(null);
  };

  const handleBlur = (event: FocusEvent<HTMLTextAreaElement>) => commit(event.target.value);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      commit(event.currentTarget.value);

      return;
    }

    if (event.key === 'Escape') setEditingNodeId(null);
  };

  return (
    <div
      className={clsx(
        'group/question relative flex max-w-[380px] min-w-[260px] flex-col overflow-visible rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] shadow-[0_2px_10px_-5px_rgba(15,23,42,0.18)] transition-shadow duration-200 hover:shadow-[0_5px_16px_-6px_rgba(15,23,42,0.28)]',
        selected && 'ring-2 ring-[color:var(--border-active)]',
        isPending && 'animate-node-pulse ring-2 ring-[color:var(--ref-border)] motion-reduce:animate-none',
      )}
    >
      {HANDLE_POSITIONS.map(({ id: handleId, position }) => (
        <Handle
          key={handleId}
          id={handleId}
          type="source"
          position={position}
          isConnectable={canEditCanvas}
          className={clsx(
            '!h-2.5 !w-2.5 !rounded-full !border !border-[color:var(--surface)] !bg-[color:var(--question)] !opacity-0 !shadow-[0_0_0_3px_var(--question-soft)] !transition-opacity',
            canEditCanvas ? 'group-hover/question:!opacity-100' : '!pointer-events-none',
          )}
        />
      ))}

      <NodeBand tone="question" label={t.platform.canvas.question.badge} />

      <div className="flex flex-col gap-2 px-5 py-4">
        {isEditing ? (
          <textarea
            ref={inputRef}
            defaultValue={label}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            rows={1}
            placeholder={t.platform.canvas.question.placeholder}
            aria-label={t.platform.canvas.question.ariaLabel}
            className="nodrag field-sizing-content w-full resize-none overflow-hidden rounded-lg bg-[color:var(--question-soft)] px-2 py-1 text-[15px] leading-relaxed font-medium tracking-tight text-[color:var(--text-strong)] ring-1 ring-[color:var(--question-border)] outline-none placeholder:text-[color:var(--text-muted)]"
          />
        ) : (
          <p
            ref={hasLabel ? labelRefCallback : undefined}
            className={clsx(
              'text-[15px] leading-relaxed font-medium tracking-tight break-words whitespace-pre-wrap select-none',
              hasLabel ? 'text-[color:var(--text-strong)]' : 'text-[color:var(--text-muted)]',
              hasLabel && !expanded && 'line-clamp-8',
            )}
          >
            {hasLabel ? label : t.platform.canvas.question.placeholder}
          </p>
        )}

        {!isEditing && hasLabel && (overflows || expanded) && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((prev) => !prev);
            }}
            onMouseDown={(event) => event.stopPropagation()}
            className="nodrag inline-flex w-fit items-center gap-0.5 rounded-md text-[10.5px] font-medium tracking-tight text-[color:var(--question)] transition-opacity hover:opacity-80"
          >
            <ChevronDown
              className={clsx('h-3 w-3 transition-transform duration-200', expanded && 'rotate-180')}
              strokeWidth={2.25}
            />
            {expanded ? t.platform.canvas.node.showLess : t.platform.canvas.node.showMore}
          </button>
        )}
      </div>
    </div>
  );
};
